import express from 'express';
import studentDataAccess from '../dataAccess/studentDataAccess.js';
import courseDataAccess from '../dataAccess/courseDataAccess.js';
import { createResponse, renderWithMessage } from '../utils.js';

const router = express.Router();

// GET request to retrieve statistics
router.get('/', async (req, res) => {
    try {
        const totalStudents = await studentDataAccess.getTotalStudents();
        const totalCourses = await courseDataAccess.getTotalCourses();
        const averageStudentsPerCourse = totalCourses > 0 ? (totalStudents / totalCourses).toFixed(2) : 0;

        const courses = await courseDataAccess.getAllCourses();
        const courseNames = courses.map(course => course.name);
        const enrolledStudentsCounts = await Promise.all(courses.map(async course => {
            const enrolledStudents = await courseDataAccess.getEnrolledStudents(course.code);
            return enrolledStudents.length;
        }));

        renderWithMessage(res, 'statistics', {
            title: 'Statistics',
            activePage: 'statistics',
            totalStudents,
            totalCourses,
            averageStudentsPerCourse,
            courseNames, // Pass course names
            enrolledStudentsCounts // Pass number of enrolled students
        });
    } catch (err) {
        console.error('Error retrieving statistics:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving statistics'));
    }
});

export default router;
