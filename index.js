// Import dependencies
const express = require('express');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const studentService = require('./services/studentService');
const courseService = require('./services/courseService');
require('dotenv').config(); // For environment variables

const app = express();

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files (css styles)
app.use(express.static(path.join(__dirname, 'public')));

// Check database connection
const pool = require('./db');
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

// Helper functions for rendering layout
const renderWithMessage = (res, view, options, message = null) => {
    res.render('layout', {
        ...options,
        content: view,
        message
    });
};

// Routes
const coursesRouter = express.Router();
const studentsRouter = express.Router();

// Home route to serve the main page
app.get('/', (req, res) => {
    renderWithMessage(res, 'index', { title: 'Home', activePage: 'home' });
});

// Serve static HTML files for course and student creation
app.get('/web/courses/create', (req, res) => {
    renderWithMessage(res, 'createCourse', { title: 'Create Course', activePage: 'createCourse' });
});

app.get('/web/students/create', (req, res) => {
    renderWithMessage(res, 'createStudent', { title: 'Create Student', activePage: 'createStudent' });
});

// Serve dynamic HTML files for viewing courses and students
app.get('/web/courses/view', async (req, res) => {
    try {
        const courses = await courseService.getAllCourses();
        renderWithMessage(res, 'viewCourses', { title: 'View Courses', activePage: 'viewCourses', courses });
    } catch (err) {
        console.error('Error retrieving courses:', err);
        res.status(500).send('An error occurred while retrieving courses');
    }
});

app.get('/web/students/view', async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        renderWithMessage(res, 'viewStudents', { title: 'View Students', activePage: 'viewStudents', students });
    } catch (err) {
        console.error('Error retrieving students:', err);
        res.status(500).send('An error occurred while retrieving students');
    }
});

// Courses API Routes

// GET request to retrieve all courses
coursesRouter.get('/', async (req, res) => {
    try {
        const courses = await courseService.getAllCourses();
        res.json(createResponse(true, 'Courses retrieved successfully', courses));
    } catch (err) {
        console.error('Error retrieving courses:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving courses'));
    }
});

// GET request to retrieve a specific course by ID
coursesRouter.get('/:id', async (req, res) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
        }
        res.json(createResponse(true, 'Course retrieved successfully', course));
    } catch (err) {
        console.error('Error retrieving course:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving the course'));
    }
});

// POST request to add a new course
coursesRouter.post('/', validateMiddleware(validateCourse), async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const course = await courseService.addCourse(name, code, description);
        renderWithMessage(res, 'createCourse', { title: 'Create Course', activePage: 'createCourse' }, { type: 'success', text: 'Course added successfully' });
    } catch (err) {
        console.error('Error adding course:', err);
        renderWithMessage(res, 'createCourse', { title: 'Create Course', activePage: 'createCourse' }, { type: 'error', text: 'An error occurred while adding the course' });
    }
});

// PUT request to update an existing course by ID
coursesRouter.put('/:id', validateMiddleware(validateCoursePut), async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const course = await courseService.updateCourse(req.params.id, name, code, description);
        if (!course) {
            return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
        }
        renderWithMessage(res, 'updateCourse', { title: 'Update Course', activePage: 'updateCourse' }, { type: 'success', text: 'Course updated successfully' });
    } catch (err) {
        console.error('Error updating course:', err);
        renderWithMessage(res, 'updateCourse', { title: 'Update Course', activePage: 'updateCourse' }, { type: 'error', text: 'An error occurred while updating the course' });
    }
});

// DELETE request to remove a course by ID
coursesRouter.delete('/:id', async (req, res) => {
    try {
        const course = await courseService.deleteCourse(req.params.id);
        if (!course) {
            return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
        }
        renderWithMessage(res, 'deleteCourse', { title: 'Delete Course', activePage: 'deleteCourse' }, { type: 'success', text: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        renderWithMessage(res, 'deleteCourse', { title: 'Delete Course', activePage: 'deleteCourse' }, { type: 'error', text: 'An error occurred while deleting the course' });
    }
});

// Students API Routes

// GET request to retrieve all students
studentsRouter.get('/', async (req, res) => {
    try {
        const students = await studentService.getAllStudents();
        res.json(createResponse(true, 'Students retrieved successfully', students));
    } catch (err) {
        console.error('Error retrieving students:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving students'));
    }
});

// GET request to retrieve a specific student by ID
studentsRouter.get('/:id', async (req, res) => {
    try {
        const student = await studentService.getStudentById(req.params.id);
        if (!student) {
            return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
        }
        res.json(createResponse(true, 'Student retrieved successfully', student));
    } catch (err) {
        console.error('Error retrieving student:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving the student'));
    }
});

// POST request to add a new student
studentsRouter.post('/', validateMiddleware(validateStudent), async (req, res) => {
    try {
        const { name, code } = req.body;
        const student = await studentService.addStudent(name, code);
        renderWithMessage(res, 'createStudent', { title: 'Create Student', activePage: 'createStudent' }, { type: 'success', text: 'Student added successfully' });
    } catch (err) {
        console.error('Error adding student:', err);
        renderWithMessage(res, 'createStudent', { title: 'Create Student', activePage: 'createStudent' }, { type: 'error', text: 'An error occurred while adding the student' });
    }
});

// PUT request to update an existing student by ID
studentsRouter.put('/:id', validateMiddleware(validateStudentPut), async (req, res) => {
    try {
        const { name, code } = req.body;
        const student = await studentService.updateStudent(req.params.id, name, code);
        if (!student) {
            return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
        }
        renderWithMessage(res, 'updateStudent', { title: 'Update Student', activePage: 'updateStudent' }, { type: 'success', text: 'Student updated successfully' });
    } catch (err) {
        console.error('Error updating student:', err);
        renderWithMessage(res, 'updateStudent', { title: 'Update Student', activePage: 'updateStudent' }, { type: 'error', text: 'An error occurred while updating the student' });
    }
});

// DELETE request to remove a student by ID
studentsRouter.delete('/:id', async (req, res) => {
    try {
        const student = await studentService.deleteStudent(req.params.id);
        if (!student) {
            return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
        }
        renderWithMessage(res, 'deleteStudent', { title: 'Delete Student', activePage: 'deleteStudent' }, { type: 'success', text: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        renderWithMessage(res, 'deleteStudent', { title: 'Delete Student', activePage: 'deleteStudent' }, { type: 'error', text: 'An error occurred while deleting the student' });
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