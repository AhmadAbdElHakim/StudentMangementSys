CREATE TABLE IF NOT EXISTS courses (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL UNIQUE PRIMARY KEY,
    description TEXT
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(7) NOT NULL UNIQUE PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS enrollments (
    student_code VARCHAR(7) NOT NULL,
    course_code VARCHAR(6) NOT NULL,
    PRIMARY KEY (student_code, course_code),
    FOREIGN KEY (student_code) REFERENCES students(code) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE
);