import pool from '../db.js';

const studentService = {
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
};

export default studentService;
