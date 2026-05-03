from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'unibot_db'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    command = data.get('command', '').lower()
    reg_number = data.get('reg_number', '')

    if not reg_number:
        return jsonify({'response': "I'm not sure who you are. Please login first."})

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get student ID from reg_number
        cursor.execute("SELECT id, name FROM students WHERE register_no = %s", (reg_number,))
        student = cursor.fetchone()
        
        if not student:
            return jsonify({'response': f"I couldn't find a student with Register Number {reg_number}."})

        student_id = student['id']
        student_name = student['name']

        if 'attendance' in command:
            cursor.execute("SELECT status, date FROM attendance WHERE student_id = %s ORDER BY date DESC LIMIT 5", (student_id,))
            records = cursor.fetchall()
            if records:
                resp = f"Hi {student_name}, here is your recent attendance:\n"
                for r in records:
                    resp += f"• {r['date']}: {r['status'].capitalize()}\n"
                return jsonify({'response': resp})
            else:
                return jsonify({'response': f"No attendance records found for {student_name}."})

        elif 'result' in command or 'marks' in command or 'grade' in command:
            cursor.execute("SELECT subject, marks, max_marks FROM results WHERE student_id = %s", (student_id,))
            records = cursor.fetchall()
            if records:
                resp = f"Here are your results, {student_name}:\n"
                total_marks = 0
                max_total = 0
                for r in records:
                    resp += f"• {r['subject']}: {r['marks']}/{r['max_marks']}\n"
                    total_marks += r['marks']
                    max_total += r['max_marks']
                
                if max_total > 0:
                    percentage = (total_marks / max_total) * 100
                    resp += f"\nTotal: {total_marks}/{max_total} ({percentage:.1f}%)"
                return jsonify({'response': resp})
            else:
                return jsonify({'response': f"No marks found in the system for {student_name}."})

        elif 'seat' in command:
            cursor.execute("SELECT seat_number FROM seating WHERE student_id = %s", (student_id,))
            record = cursor.fetchone()
            if record:
                return jsonify({'response': f"Your assigned seat number is {record['seat_number']}."})
            else:
                return jsonify({'response': f"No seat has been assigned to you yet, {student_name}."})

        elif 'navigation' in command or 'where' in command or 'navigate' in command:
            return jsonify({'response': "redirect_nav"})

        else:
            return jsonify({'response': "I can help you with attendance, results, seating, or navigation. Just ask!"})

    except Exception as e:
        return jsonify({'response': f"Error connecting to database: {str(e)}"})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    app.run(port=5000, debug=True)
