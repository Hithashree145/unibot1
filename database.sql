-- ============================================================
-- Unibot Database Schema
-- Full CRUD-ready schema for all platform tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS unibot_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE unibot_db;

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    phone        VARCHAR(15) NOT NULL,
    register_no  VARCHAR(50) NOT NULL UNIQUE,
    email        VARCHAR(150) NOT NULL UNIQUE,
    face_images  LONGTEXT DEFAULT NULL COMMENT 'JSON array of base64 encoded face images',
    approved     TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = pending, 1 = approved',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_register_no (register_no),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    phone      VARCHAR(15) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL COMMENT 'SHA-256 or bcrypt hash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_admin_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id  INT UNSIGNED NOT NULL,
    date        DATE NOT NULL,
    status      ENUM('present','absent','late') NOT NULL DEFAULT 'absent',
    marked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_student_date (student_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_att_date (date),
    INDEX idx_att_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: seating
-- ============================================================
CREATE TABLE IF NOT EXISTS seating (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id   INT UNSIGNED NOT NULL UNIQUE,
    seat_number  INT UNSIGNED NOT NULL UNIQUE,
    assigned_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_seat_number (seat_number)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: results
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    subject    VARCHAR(100) NOT NULL,
    marks      TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Out of 100',
    max_marks  TINYINT UNSIGNED NOT NULL DEFAULT 100,
    exam_date  DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_student_subject_exam (student_id, subject, exam_date),
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_res_student (student_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED: Default Admin Account
-- Password: admin123 (change immediately in production!)
-- ============================================================
INSERT IGNORE INTO admins (name, phone, email, password)
VALUES ('Super Admin', '9999999999', 'admin@unibot.edu', SHA2('admin123', 256));

-- ============================================================
-- SAMPLE DATA (Optional – comment out for production)
-- ============================================================
INSERT IGNORE INTO students (name, phone, register_no, email, approved)
VALUES
    ('Ria Sharma',    '9845416429', 'BCA2024S64', 'ria@email.com',    1),
    ('Arjun Kumar',   '9876543210', 'BCA2024S65', 'arjun@email.com',  1),
    ('Priya Nair',    '9123456789', 'BCA2024S66', 'priya@email.com',  0),
    ('Rahul Menon',   '9988776655', 'BCA2024S67', 'rahul@email.com',  1);

-- Attendance for today
INSERT IGNORE INTO attendance (student_id, date, status) VALUES
    (1, CURDATE(), 'present'),
    (2, CURDATE(), 'absent'),
    (4, CURDATE(), 'late');

-- Seating
INSERT IGNORE INTO seating (student_id, seat_number) VALUES
    (1, 1), (2, 2), (4, 3);

-- Results
INSERT IGNORE INTO results (student_id, subject, marks, exam_date) VALUES
    (1, 'Mathematics',     88, CURDATE()),
    (1, 'Computer Science',91, CURDATE()),
    (1, 'English',         74, CURDATE()),
    (2, 'Mathematics',     62, CURDATE()),
    (2, 'Computer Science',70, CURDATE()),
    (4, 'Mathematics',     45, CURDATE());
