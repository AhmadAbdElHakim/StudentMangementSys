CREATE TABLE IF NOT EXISTS staff (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL UNIQUE PRIMARY KEY,
    title VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL UNIQUE PRIMARY KEY,
    description TEXT,
    staff_code VARCHAR(6) NOT NULL,
    FOREIGN KEY (staff_code) REFERENCES staff(code) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(7) NOT NULL UNIQUE PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS enrollments (
    student_code VARCHAR(7) NOT NULL,
    course_code VARCHAR(6) NOT NULL,
    -- composite primary key ensuring that each student can enroll in a course only once
    PRIMARY KEY (student_code, course_code),
    FOREIGN KEY (student_code) REFERENCES students(code) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE
);