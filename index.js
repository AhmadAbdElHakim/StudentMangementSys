// Import dependencies
import express from 'express';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

// For environment variables
import dotenv from 'dotenv';
dotenv.config();

// Since we are using ESM (ECMAScript Modules) instead of CJS (CommonJS)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import pool from './db.js';
import coursesRouter from './routers/coursesRouter.js';
import studentsRouter from './routers/studentsRouter.js';

const app = express();

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware for method override
import methodOverride from 'method-override';
app.use(methodOverride('_method'));

// Serve static files (css styles)
app.use(express.static(path.join(__dirname, 'public')));

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

createSchema();

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

app.get('/web/courses/update', (req, res) => {
    renderWithMessage(res, 'updateCourse', { title: 'Update Course', activePage: 'updateCourse' });
});

app.get('/web/students/update', (req, res) => {
    renderWithMessage(res, 'updateStudent', { title: 'Update Student', activePage: 'updateStudent' });
});

// Serve dynamic HTML files for viewing courses and students
app.get('/web/courses/view', async (req, res) => {
    try {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/courses`);
        const data = await response.json();
        if (data.success) {
            renderWithMessage(res, 'viewCourses', { title: 'View Courses', activePage: 'viewCourses', courses: data.data });
        } else {
            res.status(500).send('An error occurred while retrieving courses');
        }
    } catch (err) {
        console.error('Error retrieving courses:', err);
        res.status(500).send('An error occurred while retrieving courses');
    }
});

app.get('/web/students/view', async (req, res) => {
    try {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/students`);
        const data = await response.json();
        if (data.success) {
            renderWithMessage(res, 'viewStudents', { title: 'View Students', activePage: 'viewStudents', students: data.data });
        } else {
            res.status(500).send('An error occurred while retrieving students');
        }
    } catch (err) {
        console.error('Error retrieving students:', err);
        res.status(500).send('An error occurred while retrieving students');
    }
});

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