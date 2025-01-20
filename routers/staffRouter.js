import express from 'express';
import staffDataAccess from '../dataAccess/staffDataAccess.js';
import courseDataAccess from '../dataAccess/courseDataAccess.js';
import { createResponse, validateMiddleware, validateStaff, validateStaffPut, handleGetAll, handleGetByCode, handlePost, handlePut, handleDelete, renderWithMessage } from '../utils.js';

const router = express.Router();

// GET request to retrieve all staff members
router.get('/', async (req, res) => {
    try {
        const staff = await staffDataAccess.getAllStaff();
        for (const member of staff) {
            member.assignedCourses = await staffDataAccess.getAssignedCourses(member.code);
        }
        res.json(createResponse(true, 'Staff retrieved successfully', staff));
    } catch (err) {
        console.error('Error retrieving staff:', err);
        res.status(500).json(createResponse(false, 'An error occurred while retrieving staff'));
    }
});

// GET request to retrieve a specific staff member by unique code
router.get('/:code', handleGetByCode(staffDataAccess.getStaffByCode, 'Staff'));

// POST request to add a new staff member
router.post('/', validateMiddleware(validateStaff), async (req, res) => {
    try {
        const { name, code, title, course_code } = req.body;
        const staff = await staffDataAccess.addStaff(name, code, title);
        if (course_code) {
            await courseDataAccess.assignStaffToCourse(course_code, code);
        }
        renderWithMessage(res, 'createStaff', { title: 'Create Staff', activePage: 'createStaff' }, { type: 'success', text: 'Staff member added successfully' });
    } catch (err) {
        if (err.code === '23505') { // Duplicate key error code in PostgreSQL
            const message = `Staff member with code ${req.body.code} already exists. Please use the update page instead.`;
            renderWithMessage(res, 'createStaff', { title: 'Create Staff', activePage: 'createStaff' }, { type: 'error', text: message });
        } else {
            console.error('Error adding staff member:', err);
            renderWithMessage(res, 'createStaff', { title: 'Create Staff', activePage: 'createStaff' }, { type: 'error', text: 'An error occurred while adding the staff member' });
        }
    }
});

// PUT request to update an existing staff member
router.put('/', validateMiddleware(validateStaffPut), async (req, res) => {
    try {
        const { name, code, title, course_code } = req.body;
        const staff = await staffDataAccess.updateStaff(name, code, title);
        if (course_code) {
            await courseDataAccess.assignStaffToCourse(course_code, code);
        }
        if (!staff) {
            renderWithMessage(res, 'updateStaff', { title: 'Update Staff', activePage: 'updateStaff' }, { type: 'error', text: 'The staff member with the given unique code was not found' });
        } else {
            renderWithMessage(res, 'updateStaff', { title: 'Update Staff', activePage: 'updateStaff' }, { type: 'success', text: 'Staff member updated successfully' });
        }
    } catch (err) {
        console.error('Error updating staff member:', err);
        renderWithMessage(res, 'updateStaff', { title: 'Update Staff', activePage: 'updateStaff' }, { type: 'error', text: 'An error occurred while updating the staff member' });
    }
});

// DELETE request to remove a staff member by unique code
router.delete('/:code', handleDelete(staffDataAccess.deleteStaff, 'Staff', '/web/staff/view'));

export default router;
