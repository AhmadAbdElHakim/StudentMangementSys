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
