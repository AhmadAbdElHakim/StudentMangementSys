import Joi from 'joi';

// Utility function for standardized responses
export const createResponse = (success, message, data = null) => ({ success, message, data });

// Helper functions for rendering layout
export const renderWithMessage = (res, view, options, message = null) => {
    res.render('layout', {
        ...options,
        content: view,
        message,
        messageClass: message && message.type === 'error' ? 'error-box' : ''
    });
};

// Generic validation middleware
export const validateMiddleware = (validator, viewName, entityName) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) {
            return renderWithMessage(res, viewName, { title: `Create ${entityName}`, activePage: `create${entityName}` }, { type: 'error', text: error.details[0].message });
        }
        next();
    };
};

// Validation Schemas

// Function to validate course data for POST requests
export const validateCourse = (course) => {
    const schema = Joi.object({
        name: Joi.string().min(5).required(),
        code: Joi.string().length(6).pattern(/^[A-Za-z]{3}[0-9]{3}$/).required(),
        description: Joi.string().max(200).optional().allow('')
    });
    return schema.validate(course);
};

// Function to validate student data for POST requests
export const validateStudent = (student) => {
    const schema = Joi.object({
        name: Joi.string().pattern(/^[A-Za-z\s-'.-]+$/).required(),
        code: Joi.string().length(7).required()
    });
    return schema.validate(student);
};

// Function to validate staff data for POST requests
export const validateStaff = (staff) => {
    const schema = Joi.object({
        name: Joi.string().min(5).pattern(/^[A-Za-z\s-'.-]+$/).required(),
        code: Joi.string().length(6).required(),
        title: Joi.string().optional().allow(null, ''),
        course_code: Joi.string().length(6).optional().allow('')
    });
    return schema.validate(staff);
};

// Function to validate course data for PUT requests
export const validateCoursePut = (course) => {
    const schema = Joi.object({
        name: Joi.string().min(5).optional().allow(''),
        code: Joi.string().length(6).pattern(/^[A-Za-z]{3}[0-9]{3}$/).optional().allow(''),
        description: Joi.string().max(200).optional().allow('')
    });
    return schema.validate(course);
};

// Function to validate student data for PUT requests
export const validateStudentPut = (student) => {
    const schema = Joi.object({
        name: Joi.string().pattern(/^[A-Za-z\s-'.-]+$/).optional().allow(''),
        code: Joi.string().length(7).optional().allow('')
    });
    return schema.validate(student);
};

// Function to validate staff data for PUT requests
export const validateStaffPut = (staff) => {
    const schema = Joi.object({
        name: Joi.string().min(5).pattern(/^[A-Za-z\s-'.-]+$/).optional().allow(''),
        code: Joi.string().length(6).optional().allow(''),
        title: Joi.string().optional().allow(null, ''),
        course_code: Joi.string().length(6).optional().allow('')
    });
    return schema.validate(staff);
};

// Helper function to handle GET requests for a specific entity by code
export const handleGetByCode = (dataAccessMethod, entityName) => async (req, res) => {
    try {
        const entity = await dataAccessMethod(req.params.code);
        if (!entity) {
            return res.status(404).json(createResponse(false, `The ${entityName.toLowerCase()} with the given unique code was not found`));
        }
        res.json(createResponse(true, `${entityName} retrieved successfully`, entity));
    } catch (err) {
        console.error(`Error retrieving ${entityName.toLowerCase()}:`, err);
        res.status(500).json(createResponse(false, `An error occurred while retrieving the ${entityName.toLowerCase()}`));
    }
};

// Helper function to handle DELETE requests for removing an entity by code
export const handleDelete = (dataAccessMethod, entityName, redirectPath) => async (req, res) => {
    try {
        const entity = await dataAccessMethod(req.params.code);
        if (!entity) {
            return res.status(404).json(createResponse(false, `The ${entityName.toLowerCase()} with the given unique code was not found`));
        }
        res.redirect(redirectPath);
    } catch (err) {
        console.error(`Error deleting ${entityName.toLowerCase()}:`, err);
        res.status(500).send(`An error occurred while deleting the ${entityName.toLowerCase()}`);
    }
};

// Helper function to handle POST requests for assigning staff to a course
export const handleAssignStaff = (courseDataAccessMethod) => async (req, res) => {
    try {
        const { course_code, staff_code } = req.body;
        await courseDataAccessMethod(course_code, staff_code);
        res.redirect('/web/courses/view');
    } catch (err) {
        console.error('Error assigning staff to course:', err);
        res.status(500).send('An error occurred while assigning staff to course');
    }
};
