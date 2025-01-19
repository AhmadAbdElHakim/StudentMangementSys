import pool from '../db.js';

const courseService = {
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
};

export default courseService;

