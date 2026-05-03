import cv2
import face_recognition
import mysql.connector
import os
import numpy as np
import pandas as pd
from datetime import datetime, date
import sys

# Configuration
DATASET_PATH = 'dataset'
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'unibot_db'
}

def connect_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        print("Please ensure XAMPP MySQL is running and the 'unibot' database is created.")
        sys.exit(1)

def load_known_faces():
    """Load and encode faces from the dataset directory."""
    known_face_encodings = []
    known_face_reg_numbers = []

    if not os.path.exists(DATASET_PATH):
        os.makedirs(DATASET_PATH)
        print(f"Created {DATASET_PATH} directory. Please add student images.")
        return [], []

    print("Loading known faces...")
    for filename in os.listdir(DATASET_PATH):
        if filename.endswith(('.jpg', '.jpeg', '.png')):
            # The filename (without extension) is treated as the reg_number
            reg_number = os.path.splitext(filename)[0]
            img_path = os.path.join(DATASET_PATH, filename)
            
            try:
                img = face_recognition.load_image_file(img_path)
                encodings = face_recognition.face_encodings(img)
                if encodings:
                    known_face_encodings.append(encodings[0])
                    known_face_reg_numbers.append(reg_number)
                    print(f"Loaded: {reg_number}")
                else:
                    print(f"Warning: No face found in {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                
    return known_face_encodings, known_face_reg_numbers

def mark_attendance(conn, reg_number):
    """Mark attendance in the database."""
    cursor = conn.cursor(dictionary=True)
    today = date.today()
    
    # First get the student_id from register_no
    cursor.execute("SELECT id FROM students WHERE register_no = %s", (reg_number,))
    student = cursor.fetchone()
    
    if not student:
        print(f"Warning: Student with register number {reg_number} not found in database.")
        return False
        
    student_id = student['id']

    # Check if already marked present today
    cursor.execute("""
        SELECT * FROM attendance 
        WHERE student_id = %s AND date = %s
    """, (student_id, today))
    
    result = cursor.fetchone()
    
    if result is None:
        # Mark as Present
        cursor.execute("""
            INSERT INTO attendance (student_id, date, status) 
            VALUES (%s, %s, %s)
        """, (student_id, today, 'present'))
        conn.commit()
        print(f"Attendance marked for {reg_number} (ID: {student_id}) today.")
        return True
    return False

def generate_report_and_alerts(conn):
    """Generate Excel report and simulate SMS alerts for absent students."""
    print("\n--- Generating End of Day Report ---")
    today = date.today()
    cursor = conn.cursor(dictionary=True)

    # Get all students
    cursor.execute("SELECT register_no as reg_number, name, phone FROM students")
    all_students = cursor.fetchall()

    # Get today's attendance
    cursor.execute("""
        SELECT s.register_no as reg_number 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = %s AND a.status = 'present'
    """, (today,))
    present_records = cursor.fetchall()
    present_reg_numbers = [record['reg_number'] for record in present_records]

    report_data = []

    for student in all_students:
        status = 'Present' if student['reg_number'] in present_reg_numbers else 'Absent'
        
        report_data.append({
            'Reg Number': student['reg_number'],
            'Name': student['name'],
            'Phone': student['phone'],
            'Date': str(today),
            'Status': status
        })

        if status == 'Absent':
            # Simulate SMS Alert
            print(f"[SMS ALERT] Sent to {student['phone']}: 'Dear parent, your ward {student['name']} ({student['reg_number']}) is absent today ({today}).'")

    # Generate Excel using pandas
    if report_data:
        df = pd.DataFrame(report_data)
        excel_filename = f"Attendance_Report_{today}.xlsx"
        df.to_excel(excel_filename, index=False)
        print(f"\nExcel report generated: {excel_filename}")
    else:
        print("\nNo student records found in the database to generate report.")

def main():
    conn = connect_db()
    known_face_encodings, known_face_reg_numbers = load_known_faces()

    if not known_face_encodings:
        print("No known faces loaded. Exiting...")
        return

    # Start video capture
    print("\nStarting video stream. Press 'q' to quit.")
    video_capture = cv2.VideoCapture(0)

    # Variables for processing every other frame to speed up
    process_this_frame = True

    while True:
        ret, frame = video_capture.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Only process every other frame of video to save time
        if process_this_frame:
            # Resize frame for faster face recognition processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            # Convert the image from BGR color to RGB color (which face_recognition uses)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Find all the faces and face encodings in the current frame of video
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            face_names = []
            for face_encoding in face_encodings:
                # See if the face is a match for the known face(s)
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"

                # Use the known face with the smallest distance to the new face
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        reg_number = known_face_reg_numbers[best_match_index]
                        name = reg_number
                        mark_attendance(conn, reg_number)

                face_names.append(name)

        process_this_frame = not process_this_frame

        # Display the results
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            # Draw a box around the face
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

        # Display the resulting image
        cv2.imshow('Unibot - Face Recognition CCTV Simulation', frame)

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release handle to the webcam
    video_capture.release()
    cv2.destroyAllWindows()

    # Post-processing: Alerts and Reports
    generate_report_and_alerts(conn)
    conn.close()

if __name__ == '__main__':
    main()
