import pool from '../db.js';

const courseDataAccess = {
    getAllCourses: async () => {
        const { rows } = await pool.query('SELECT * FROM courses');
        return rows;
    },
    
    getCourseByCode: async (code) => {
        const { rows } = await pool.query('SELECT * FROM courses WHERE code = $1', [code]);
        return rows[0];
    },
    
    addCourse: async (name, code, description) => {
        const { rows } = await pool.query(
            'INSERT INTO courses (name, code, description) VALUES ($1, $2, $3) RETURNING *',
            [name, code, description]
        );
        return rows[0];
    },
    
    updateCourse: async (name, code, description) => {
        const { rows } = await pool.query(
            'UPDATE courses SET name = $1, description = $2 WHERE code = $3 RETURNING *',
            [name, description, code]
        );
        return rows[0];
    },
    
    deleteCourse: async (code) => {
        const { rows } = await pool.query('DELETE FROM courses WHERE code = $1 RETURNING *', [code]);
        return rows[0];
    },
    
    getEnrolledStudents: async (courseCode) => {
        const { rows } = await pool.query(
            'SELECT students.name, students.code FROM students JOIN enrollments ON students.code = enrollments.student_code WHERE enrollments.course_code = $1',
            [courseCode]
        );
        return rows;
    },

    assignStaffToCourse : async (courseCode, staffCode) => {
        await pool.query('UPDATE courses SET staff_code = $1 WHERE code = $2', [staffCode, courseCode]);
    },
    
    getStaffByCourseCode : async (courseCode) => {
        const result = await pool.query(
            'SELECT staff.name, staff.code FROM staff JOIN courses ON staff.code = courses.staff_code WHERE courses.code = $1',
            [courseCode]
        );
        return result.rows[0];
    },

    getTotalCourses: async () => {
        const { rows } = await pool.query('SELECT COUNT(*) AS total FROM courses');
        return parseInt(rows[0].total, 10);
    }
};

export default courseDataAccess;