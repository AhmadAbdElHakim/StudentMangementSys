import pool from '../db.js';

const studentDataAccess = {
    getAllStudents: async () => {
        const { rows } = await pool.query('SELECT * FROM students');
        return rows;
    },

    getStudentByCode: async (code) => {
        const { rows } = await pool.query('SELECT * FROM students WHERE code = $1', [code]);
        return rows[0];
    },

    addStudent: async (name, code) => {
        const { rows } = await pool.query(
            'INSERT INTO students (name, code) VALUES ($1, $2) RETURNING *',
            [name, code]
        );
        return rows[0];
    },

    updateStudent: async (name, code) => {
        const { rows } = await pool.query(
            'UPDATE students SET name = $1 WHERE code = $2 RETURNING *',
            [name, code]
        );
        return rows[0];
    },

    deleteStudent: async (code) => {
        const { rows } = await pool.query('DELETE FROM students WHERE code = $1 RETURNING *', [code]);
        return rows[0];
    },

    getEnrolledCourses: async (student_code) => {
        const { rows } = await pool.query(
            'SELECT courses.* FROM courses JOIN enrollments ON courses.code = enrollments.course_code WHERE enrollments.student_code = $1',
            [student_code]
        );
        return rows;
    },

    enrollInCourse: async (student_code, course_code) => {
        const { rows } = await pool.query(
            'INSERT INTO enrollments (student_code, course_code) VALUES ($1, $2) RETURNING *',
            [student_code, course_code]
        );
        return rows[0];
    },

    unenrollFromCourse: async (student_code, course_code) => {
        const { rows } = await pool.query(
            'DELETE FROM enrollments WHERE student_code = $1 AND course_code = $2 RETURNING *',
            [student_code, course_code]
        );
        return rows[0];
    }
};

export default studentDataAccess;
