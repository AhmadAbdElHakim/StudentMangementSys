const pool = require('../db');

const courseService = {

    getAllCourses : async () => {
        const { rows } = await pool.query('SELECT * FROM courses');
        return rows;
    },
    
    getCourseById : async (id) => {
        const { rows } = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
        return rows[0];
    },
    
    addCourse : async (name, code, description) => {
        const { rows } = await pool.query(
            'INSERT INTO courses (name, code, description) VALUES ($1, $2, $3) RETURNING *',
            [name, code, description]
        );
        return rows[0];
    },
    
    updateCourse : async (id, name, code, description) => {
        const { rows } = await pool.query(
            'UPDATE courses SET name = $1, code = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, code, description, id]
        );
        return rows[0];
    },
    
    deleteCourse : async (id) => {
        const { rows } = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    },
};

module.exports = courseService;

