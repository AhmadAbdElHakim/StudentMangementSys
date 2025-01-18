// Import dependencies

// Import Express lib for building the LMS web app
const express = require('express');
// For validating user input
const Joi = require('joi');
// For joining file paths
const path = require('path');
// For reading files
const fs = require('fs');
// Import the database connection
const pool = require('./db');
// For environment variables (listening port)
require('dotenv').config(); 

const app = express();

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
// To handle JSON payloads (data from an API request)
app.use(express.json());

// Check database connection
pool.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

// Create database schema
const createSchema = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('Database schema created');
    } catch (err) {
        console.error('Failed to create database schema:', err);
    }
};

// Populate the database with initial data
const populateDatabase = async () => {
    try {
        await pool.query(`
            INSERT INTO courses (name, code, description) VALUES
            ('Database', 'CSE452', 'Good'),
            ('Multimedia', 'CSE458', ''),
            ('Control', 'CSE462', 'Bad')
            ON CONFLICT (code) DO NOTHING;
        `);

        await pool.query(`
            INSERT INTO students (name, code) VALUES
            ('Ahmad', '1600122'),
            ('AbdELHakim', '1600133'),
            ('Deif', '1600144')
            ON CONFLICT (code) DO NOTHING;
        `);

        console.log('Database populated with initial data');
    } catch (err) {
        console.error('Failed to populate the database:', err);
    }
};

// Initialize database
const initializeDatabase = async () => {
    await createSchema();
    await populateDatabase();
};

initializeDatabase();

// Utility function for standardized responses
const createResponse = (success, message, data = null) => ({ success, message, data });

// Routes
const coursesRouter = express.Router();
const studentsRouter = express.Router();

// Home route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static HTML files for course and student creation
app.get('/web/courses/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'courses.html'));
});

app.get('/web/students/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'students.html'));
});

// Courses API Routes

// GET request to retrieve all courses
coursesRouter.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM courses');
        res.json(createResponse(true, 'Courses retrieved successfully', rows));
    } catch (err) {
        console.error('Error retrieving courses:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving courses'));
    }
});

// GET request to retrieve a specific course by ID
coursesRouter.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
        }
        res.json(createResponse(true, 'Course retrieved successfully', rows[0]));
    } catch (err) {
        console.error('Error retrieving course:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving the course'));
    }
});

// POST request to add a new course
coursesRouter.post('/', validateMiddleware(validateCourse), async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO courses (name, code, description) VALUES ($1, $2, $3) RETURNING *',
            [name, code, description]
        );
        res.json(createResponse(true, 'Course added successfully', rows[0]));
    } catch (err) {
        console.error('Error adding course:', err);
        res.status(500).json(createResponse(false, 'An error occurred while adding the course'));
    }
});

// PUT request to update an existing course by ID
coursesRouter.put('/:id', validateMiddleware(validateCoursePut), async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const { rows } = await pool.query(
            'UPDATE courses SET name = $1, code = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, code, description, req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
        }
        res.json(createResponse(true, 'Course updated successfully', rows[0]));
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json(createResponse(false, 'An error occurred while updating the course'));
    }
});

// DELETE request to remove a course by ID
coursesRouter.delete('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
        }
        res.json(createResponse(true, 'Course deleted successfully', rows[0]));
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json(createResponse(false, 'An error occurred while deleting the course'));
    }
});

// Students API Routes

// GET request to retrieve all students
studentsRouter.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM students');
        res.json(createResponse(true, 'Students retrieved successfully', rows));
    } catch (err) {
        console.error('Error retrieving students:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving students'));
    }
});

// GET request to retrieve a specific student by ID
studentsRouter.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
        }
        res.json(createResponse(true, 'Student retrieved successfully', rows[0]));
    } catch (err) {
        console.error('Error retrieving student:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving the student'));
    }
});

// POST request to add a new student
studentsRouter.post('/', validateMiddleware(validateStudent), async (req, res) => {
    try {
        const { name, code } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO students (name, code) VALUES ($1, $2) RETURNING *',
            [name, code]
        );
        res.json(createResponse(true, 'Student added successfully', rows[0]));
    } catch (err) {
        console.error('Error adding student:', err);
        res.status(500).json(createResponse(false, 'An error occurred while adding the student'));
    }
});

// PUT request to update an existing student by ID
studentsRouter.put('/:id', validateMiddleware(validateStudentPut), async (req, res) => {
    try {
        const { name, code } = req.body;
        const { rows } = await pool.query(
            'UPDATE students SET name = $1, code = $2 WHERE id = $3 RETURNING *',
            [name, code, req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
        }
        res.json(createResponse(true, 'Student updated successfully', rows[0]));
    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json(createResponse(false, 'An error occurred while updating the student'));
    }
});

// DELETE request to remove a student by ID
studentsRouter.delete('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
        }
        res.json(createResponse(true, 'Student deleted successfully', rows[0]));
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json(createResponse(false, 'An error occurred while deleting the student'));
    }
});

// Middleware Functions for Validation

// Generic validation middleware
function validateMiddleware(validator) {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) return res.status(400).json(createResponse(false, error.details[0].message));
        next();
    };
}

// Validation Schemas

// Function to validate course data for POST requests
function validateCourse(course) {
    const schema = Joi.object({
        name: Joi.string().min(5).required(),
        code: Joi.string().length(6).pattern(/^[A-Za-z]{3}[0-9]{3}$/).required(),
        description: Joi.string().max(200).optional().allow('')
    });
    return schema.validate(course);
}

// Function to validate student data for POST requests
function validateStudent(student) {
    const schema = Joi.object({
        name: Joi.string().pattern(/^[A-Za-z-']+$/).required(),
        code: Joi.string().length(7).required()
    });
    return schema.validate(student);
}

// Function to validate course data for PUT requests
function validateCoursePut(course) {
    const schema = Joi.object({
        name: Joi.string().min(5).optional().allow(''),
        code: Joi.string().length(6).pattern(/^[A-Za-z]{3}[0-9]{3}$/).optional().allow(''),
        description: Joi.string().max(200).optional().allow('')
    });
    return schema.validate(course);
}

// Function to validate student data for PUT requests
function validateStudentPut(student) {
    const schema = Joi.object({
        name: Joi.string().pattern(/^[A-Za-z-']+$/).optional().allow(''),
        code: Joi.string().length(7).optional().allow('')
    });
    return schema.validate(student);
}

// Mount the routers to their respective paths
app.use('/api/courses', coursesRouter);
app.use('/api/students', studentsRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json(createResponse(false, 'An unexpected error occurred'));
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});