import pool from '../db.js';

const studentService = {
    getAllStudents: async () => {
        const { rows } = await pool.query('SELECT * FROM students');
        return rows;
    },

    getStudentById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        return rows[0];
    },

    addStudent: async (name, code) => {
        const { rows } = await pool.query(
            'INSERT INTO students (name, code) VALUES ($1, $2) RETURNING *',
            [name, code]
        );
        return rows[0];
    },

    updateStudent: async (id, name, code) => {
        const { rows } = await pool.query(
            'UPDATE students SET name = $1, code = $2 WHERE id = $3 RETURNING *',
            [name, code, id]
        );
        return rows[0];
    },

    deleteStudent: async (id) => {
        const { rows } = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    },
};

export default studentService;
