import express from 'express';
import studentDataAccess from '../dataAccess/studentDataAccess.js';
import { createResponse, renderWithMessage, validateMiddleware, validateStudent, validateStudentPut } from '../utils.js';

const router = express.Router();

// GET request to retrieve all students with their enrolled courses
router.get('/', async (req, res) => {
    try {
        const students = await studentDataAccess.getAllStudents();
        for (const student of students) {
            student.enrolledCourses = await studentDataAccess.getEnrolledCourses(student.code);
        }
        res.json(createResponse(true, 'Students retrieved successfully', students));
    } catch (err) {
        console.error('Error retrieving students:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving students'));
    }
});

// GET request to retrieve a specific student by unique code
router.get('/:code', async (req, res) => {
    try {
        const student = await studentDataAccess.getStudentByCode(req.params.code);
        if (!student) {
            return res.status(404).json(createResponse(false, 'The student with the given unique code was not found'));
        }
        res.json(createResponse(true, 'Student retrieved successfully', student));
    } catch (err) {
        console.error('Error retrieving student:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving the student'));
    }
});

// POST request to add a new student
router.post('/', validateMiddleware(validateStudent, 'createStudent', 'Student'), async (req, res) => {
    try {
        const { name, code } = req.body;
        const student = await studentDataAccess.addStudent(name, code);
        renderWithMessage(res, 'createStudent', { title: 'Create Student', activePage: 'createStudent' }, { type: 'success', text: 'Student added successfully' });
    } catch (err) {
        if (err.code === '23505') { // Duplicate key error code in PostgreSQL
            const message = `Student with code ${req.body.code} already exists. Please use the update page instead.`;
            renderWithMessage(res, 'createStudent', { title: 'Create Student', activePage: 'createStudent' }, { type: 'error', text: message });
        } else {
            console.error('Error adding student:', err);
            renderWithMessage(res, 'createStudent', { title: 'Create Student', activePage: 'createStudent' }, { type: 'error', text: 'An error occurred while adding the student' });
        }
    }
});

// POST request to enroll a student in a course
router.post('/:code/enroll', async (req, res) => {
    try {
        const { course_code } = req.body;
        await studentDataAccess.enrollInCourse(req.params.code, course_code);
        res.redirect('/web/students/view');
    } catch (err) {
        console.error('Error enrolling student in course:', err);
        res.status(500).send('An error occurred while enrolling student in course');
    }
});

// PUT request to update an existing student
router.put('/', validateMiddleware(validateStudentPut, 'updateStudent', 'Student'), async (req, res) => {
    try {
        const { name, code } = req.body;
        const student = await studentDataAccess.updateStudent(name, code);
        if (!student) {
            return renderWithMessage(res, 'updateStudent', { title: 'Update Student', activePage: 'updateStudent' }, { type: 'error', text: 'The student with the given unique code was not found' });
        }
        renderWithMessage(res, 'updateStudent', { title: 'Update Student', activePage: 'updateStudent' }, { type: 'success', text: 'Student updated successfully' });
    } catch (err) {
        console.error('Error updating student:', err);
        renderWithMessage(res, 'updateStudent', { title: 'Update Student', activePage: 'updateStudent' }, { type: 'error', text: 'An error occurred while updating the student' });
    }
});

// DELETE request to unenroll a student from a course
router.delete('/:code/unenroll', async (req, res) => {
    try {
        const { course_code } = req.body;
        await studentDataAccess.unenrollFromCourse(req.params.code, course_code);
        res.redirect('/web/students/view');
    } catch (err) {
        console.error('Error unenrolling student from course:', err);
        res.status(500).send('An error occurred while unenrolling student from course');
    }
});

// DELETE request to remove a student by unique code
router.delete('/:code', async (req, res) => {
    try {
        const student = await studentDataAccess.deleteStudent(req.params.code);
        if (!student) {
            return res.status(404).json(createResponse(false, 'The student with the given unique code was not found'));
        }
        res.redirect('/web/students/view');
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).send('An error occurred while deleting the student');
    }
});

export default router;
