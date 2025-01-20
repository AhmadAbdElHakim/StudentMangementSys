import Joi from 'joi';

// Utility function for standardized responses
export const createResponse = (success, message, data = null) => ({ success, message, data });

// Helper functions for rendering layout
export const renderWithMessage = (res, view, options, message = null) => {
    res.render('layout', {
        ...options,
        content: view,
        message
    });
};

// Generic validation middleware
export const validateMiddleware = (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) return res.status(400).json(createResponse(false, error.details[0].message));
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
        name: Joi.string().pattern(/^[A-Za-z-']+$/).required(),
        code: Joi.string().length(7).required()
    });
    return schema.validate(student);
};

// Function to validate staff data for POST requests
export const validateStaff = (staff) => {
    const schema = Joi.object({
        name: Joi.string().min(5).required(),
        code: Joi.string().length(7).required(),
        title: Joi.string().min(3).required(),
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
        name: Joi.string().pattern(/^[A-Za-z-']+$/).optional().allow(''),
        code: Joi.string().length(7).optional().allow('')
    });
    return schema.validate(student);
};

// Function to validate staff data for PUT requests
export const validateStaffPut = (staff) => {
    const schema = Joi.object({
        name: Joi.string().min(5).optional().allow(''),
        code: Joi.string().length(7).optional().allow(''),
        title: Joi.string().min(3).optional().allow(''),
        course_code: Joi.string().length(6).optional().allow('')
    });
    return schema.validate(staff);
};

// Helper function to handle GET requests for all entities
export const handleGetAll = (dataAccessMethod, entityName) => async (req, res) => {
    try {
        const entities = await dataAccessMethod();
        res.json(createResponse(true, `${entityName} retrieved successfully`, entities));
    } catch (err) {
        console.error(`Error retrieving ${entityName.toLowerCase()}:`, err);
        res.status(500).json(createResponse(false, `An error occurred while retrieving ${entityName.toLowerCase()}`));
    }
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

// Helper function to handle POST requests for adding a new entity
export const handlePost = (dataAccessMethod, entityName, viewName) => async (req, res) => {
    try {
        const entity = await dataAccessMethod(req.body);
        renderWithMessage(res, viewName, { title: `Create ${entityName}`, activePage: `create${entityName}` }, { type: 'success', text: `${entityName} added successfully` });
    } catch (err) {
        if (err.code === '23505') { // Duplicate key error code in PostgreSQL
            const message = `${entityName} with code ${req.body.code} already exists. Please use the update page instead.`;
            renderWithMessage(res, viewName, { title: `Create ${entityName}`, activePage: `create${entityName}` }, { type: 'error', text: message });
        } else {
            console.error(`Error adding ${entityName.toLowerCase()}:`, err);
            renderWithMessage(res, viewName, { title: `Create ${entityName}`, activePage: `create${entityName}` }, { type: 'error', text: `An error occurred while adding the ${entityName.toLowerCase()}` });
        }
    }
};

// Helper function to handle PUT requests for updating an existing entity
export const handlePut = (dataAccessMethod, entityName, viewName) => async (req, res) => {
    try {
        const entity = await dataAccessMethod(req.body);
        if (!entity) {
            renderWithMessage(res, viewName, { title: `Update ${entityName}`, activePage: `update${entityName}` }, { type: 'error', text: `The ${entityName.toLowerCase()} with the given unique code was not found` });
        }
        renderWithMessage(res, viewName, { title: `Update ${entityName}`, activePage: `update${entityName}` }, { type: 'success', text: `${entityName} updated successfully` });
    } catch (err) {
        console.error(`Error updating ${entityName.toLowerCase()}:`, err);
        renderWithMessage(res, viewName, { title: `Update ${entityName}`, activePage: `update${entityName}` }, { type: 'error', text: `An error occurred while updating the ${entityName.toLowerCase()}` });
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
