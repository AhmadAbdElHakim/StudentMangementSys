import express from 'express';
import courseDataAccess from '../dataAccess/courseDataAccess.js';
import { createResponse, renderWithMessage, validateMiddleware, validateCourse, validateCoursePut, handleGetAll, handleGetByCode, handlePost, handlePut, handleDelete } from '../utils.js';

const router = express.Router();

// GET request to retrieve all courses
router.get('/', async (req, res) => {
    try {
        const courses = await courseDataAccess.getAllCourses();
        for (const course of courses) {
            course.enrolledStudents = await courseDataAccess.getEnrolledStudents(course.code);
            course.staff = await courseDataAccess.getStaffByCourseCode(course.code);
        }
        res.json(createResponse(true, 'Courses retrieved successfully', courses));
    } catch (err) {
        console.error('Error retrieving courses:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving courses'));
    }
});

// GET request to retrieve a specific course by unique code
router.get('/:code', async (req, res) => {
    try {
        const courseCode = req.params.code;
        console.log(`Retrieving course with code: ${courseCode}`);
        const course = await courseDataAccess.getCourseByCode(courseCode);
        if (!course) {
            console.log(`Course with code ${courseCode} not found`);
            return res.status(404).json(createResponse(false, 'The course with the given unique code was not found'));
        }
        course.enrolledStudents = await courseDataAccess.getEnrolledStudents(course.code);
        course.staff = await courseDataAccess.getStaffByCourseCode(course.code);
        res.json(createResponse(true, 'Course retrieved successfully', course));
    } catch (err) {
        console.error('Error retrieving course:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving the course'));
    }
});

// POST request to add a new course
router.post('/', validateMiddleware(validateCourse, 'createCourse', 'Course'), async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const course = await courseDataAccess.addCourse(name, code, description);
        renderWithMessage(res, 'createCourse', { title: 'Create Course', activePage: 'createCourse' }, { type: 'success', text: 'Course added successfully' });
    } catch (err) {
        if (err.code === '23505') { // Duplicate key error code in PostgreSQL
            const message = `Course with code ${req.body.code} already exists. Please use the update page instead.`;
            renderWithMessage(res, 'createCourse', { title: 'Create Course', activePage: 'createCourse' }, { type: 'error', text: message });
        } else {
            console.error('Error adding course:', err);
            renderWithMessage(res, 'createCourse', { title: 'Create Course', activePage: 'createCourse' }, { type: 'error', text: 'An error occurred while adding the course' });
        }
    }
});

// PUT request to update an existing course
router.put('/', validateMiddleware(validateCoursePut, 'updateCourse', 'Course'), async (req, res) => {
    try {
        const course = await courseDataAccess.updateCourse(req.body.name, req.body.code, req.body.description);
        if (!course) {
            return renderWithMessage(res, 'updateCourse', { title: 'Update Course', activePage: 'updateCourse' }, { type: 'error', text: 'The course with the given unique code was not found' });
        }
        renderWithMessage(res, 'updateCourse', { title: 'Update Course', activePage: 'updateCourse' }, { type: 'success', text: 'Course updated successfully' });
    } catch (err) {
        console.error('Error updating course:', err);
        renderWithMessage(res, 'updateCourse', { title: 'Update Course', activePage: 'updateCourse' }, { type: 'error', text: 'An error occurred while updating the course' });
    }
});

// DELETE request to remove a course by unique code
router.delete('/:code', async (req, res) => {
    try {
        const courseCode = req.params.code;
        console.log(`Deleting course with code: ${courseCode}`);
        const course = await courseDataAccess.deleteCourse(courseCode);
        if (!course) {
            console.log(`Course with code ${courseCode} not found`);
            return res.status(404).json(createResponse(false, 'The course with the given unique code was not found'));
        }
        res.redirect('/web/courses/view');
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).send('An error occurred while deleting the course');
    }
});

// POST request to assign staff to a course
router.post('/assignStaff', async (req, res) => {
    try {
        const { course_code, staff_code } = req.body;
        await courseDataAccess.assignStaffToCourse(course_code, staff_code);
        res.redirect('/web/courses/view');
    } catch (err) {
        console.error('Error assigning staff to course:', err);
        res.status(500).send('An error occurred while assigning staff to course');
    }
});

export default router;
