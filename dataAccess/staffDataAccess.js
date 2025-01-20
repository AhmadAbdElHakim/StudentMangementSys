import pool from '../db.js';

const staffDataAccess = {
    getAllStaff: async () => {
        const { rows } = await pool.query('SELECT * FROM staff');
        return rows;
    },
    
    getStaffByCode: async (code) => {
        const { rows } = await pool.query('SELECT * FROM staff WHERE code = $1', [code]);
        return rows[0];
    },
    
    addStaff: async (name, code, title) => {
        const { rows } = await pool.query(
            'INSERT INTO staff (name, code, title) VALUES ($1, $2, $3) RETURNING *',
            [name, code, title]
        );
        return rows[0];
    },
    
    updateStaff: async (name, code, title) => {
        const { rows } = await pool.query(
            'UPDATE staff SET name = $1, title = $2 WHERE code = $3 RETURNING *',
            [name, title, code]
        );
        return rows[0];
    },
    
    deleteStaff: async (code) => {
        const { rows } = await pool.query('DELETE FROM staff WHERE code = $1 RETURNING *', [code]);
        return rows[0];
    },
    
    getAssignedCourses: async (staffCode) => {
        const { rows } = await pool.query(
            'SELECT courses.name, courses.code FROM courses WHERE staff_code = $1',
            [staffCode]
        );
        return rows;
    }
};

export default staffDataAccess;
