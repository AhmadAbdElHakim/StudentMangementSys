// Import dependencies
const express = require('express');
const Joi = require('joi');
const path = require('path');
require('dotenv').config(); // For environment variables

const app = express();

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Data store (mock database)
const courses = [
    { id: 1, name: 'Database', code: 'CSE452', description: 'Good' },
    { id: 2, name: 'Multimedia', code: 'CSE458' },
    { id: 3, name: 'Control', code: 'CSE462', description: 'Bad' }
];

const students = [
    { id: 1, name: 'Ahmad', code: '1600122' },
    { id: 2, name: 'AbdELHakim', code: '1600133' },
    { id: 3, name: 'Deif', code: '1600144' }
];

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
coursesRouter.get('/', (req, res) => {
    res.json(createResponse(true, 'Courses retrieved successfully', courses));
});

// GET request to retrieve a specific course by ID
coursesRouter.get('/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
    }
    res.json(createResponse(true, 'Course retrieved successfully', course));
});

// POST request to add a new course
coursesRouter.post('/', validateMiddleware(validateCourse), (req, res) => {
    const newCourse = {
        id: courses.length ? courses[courses.length - 1].id + 1 : 1,
        name: req.body.name,
        code: req.body.code,
        description: req.body.description || ''
    };
    courses.push(newCourse);
    res.json(createResponse(true, 'Course added successfully', newCourse));
});

// PUT request to update an existing course by ID
coursesRouter.put('/:id', validateMiddleware(validateCoursePut), (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
    }
    Object.assign(course, req.body);
    res.json(createResponse(true, 'Course updated successfully', course));
});

// DELETE request to remove a course by ID
coursesRouter.delete('/:id', (req, res) => {
    const courseIndex = courses.findIndex(c => c.id === parseInt(req.params.id));
    if (courseIndex === -1) {
        return res.status(404).json(createResponse(false, 'The course with the given ID was not found'));
    }
    const deletedCourse = courses.splice(courseIndex, 1)[0];
    res.json(createResponse(true, 'Course deleted successfully', deletedCourse));
});

// Students API Routes

// GET request to retrieve all students
studentsRouter.get('/', (req, res) => {
    res.json(createResponse(true, 'Students retrieved successfully', students));
});

// GET request to retrieve a specific student by ID
studentsRouter.get('/:id', (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (!student) {
        return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
    }
    res.json(createResponse(true, 'Student retrieved successfully', student));
});

// POST request to add a new student
studentsRouter.post('/', validateMiddleware(validateStudent), (req, res) => {
    const newStudent = {
        id: students.length ? students[students.length - 1].id + 1 : 1,
        name: req.body.name,
        code: req.body.code
    };
    students.push(newStudent);
    res.json(createResponse(true, 'Student added successfully', newStudent));
});

// PUT request to update an existing student by ID
studentsRouter.put('/:id', validateMiddleware(validateStudentPut), (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (!student) {
        return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
    }
    Object.assign(student, req.body);
    res.json(createResponse(true, 'Student updated successfully', student));
});

// DELETE request to remove a student by ID
studentsRouter.delete('/:id', (req, res) => {
    const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
    if (studentIndex === -1) {
        return res.status(404).json(createResponse(false, 'The student with the given ID was not found'));
    }
    const deletedStudent = students.splice(studentIndex, 1)[0];
    res.json(createResponse(true, 'Student deleted successfully', deletedStudent));
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

// Use Routers
app.use('/api/courses', coursesRouter);
app.use('/api/students', studentsRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json(createResponse(false, 'An unexpected error occurred'));
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
