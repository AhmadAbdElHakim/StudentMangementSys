const Joi = require('joi');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const courses = [
    {id:1, name:'Database', code:'CSE452', description:'Good'},
    {id:2, name:'Multimedia', code:'CSE458'},
    {id:3, name:'Control', code:'CSE462', description:'Bad'}
]

const students = [
    {id:1, name:'Ahmad', code:'1600122'},
    {id:2, name:'AbdELHakim', code:'1600133'},
    {id:3, name:'Deif', code:'1600144'}
]

app.get('/web/courses/create', function(req,res) {
    res.sendFile(path.join(__dirname + '/courses.html'));
});

app.get('/web/students/create', function(req, res) {
    res.sendFile(path.join(__dirname + '/students.html'));
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id == parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');
    res.send(course);
});

app.post('/api/courses',(req, res) => {
    const { error } = validateCourse(req.body);
    if(error)  return res.status(400).send(error.details[0].message);
    const course = {
        id: parseInt(courses[courses.length - 1].id) + 1,
        name: req.body.name,
        code: req.body.code,
        description: req.body.description
    };
    courses.push(course);
    res.send('The course has been successfully added with the given information.');
});

app.put('/api/courses/:id',(req, res) => {
    const course = courses.find(c => c.id == parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');
    const { error } = validateCoursePut(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    if(!req.body.name && !req.body.code && !req.body.description) return res.status(400).send('Add something to be updated');
    if(req.body.name) course.name = req.body.name;
    if(req.body.code) course.code = req.body.code;
    if(req.body.description) course.description = req.body.description;
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id == parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(course);
});

app.get('/api/students', (req, res) => {
    res.send(students);
});

app.get('/api/students/:id', (req, res) => {
    const student = students.find(c => c.id == parseInt(req.params.id));
    if(!student) return res.status(404).send('The student with the given ID was not found');
    res.send(student);
});

app.post('/api/students',(req, res) => {
    const { error } = validateStudent(req.body);
    if(error)  return res.status(400).send(error.details[0].message);
    const student = {
        id: parseInt(students[students.length - 1].id) + 1,
        name: req.body.name,
        code: req.body.code
    };
    students.push(student);
    res.send('The student has been successfully added with the given information.');
});

app.put('/api/students/:id',(req, res) => {
    const student = students.find(c => c.id == parseInt(req.params.id));
    if(!student) return res.status(404).send('The student with the given ID was not found');
    const { error } = validateStudentPut(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    if(!req.body.name && !req.body.code && !req.body.description) return res.status(400).send('Add something to be updated');
    if(req.body.name) student.name = req.body.name;
    if(req.body.code) student.code = req.body.code;
    res.send(student);
});

app.delete('/api/students/:id', (req, res) => {
    const student = students.find(c => c.id == parseInt(req.params.id));
    if(!student) return res.status(404).send('The student with the given ID was not found');
    const index = students.indexOf(student);
    students.splice(index, 1);
    res.send(student);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});

function validateCourse(course)
{
    const schema = Joi.object({ 
        name: Joi.string().min(5).required(),
        code: Joi.string().length(6).pattern(/^[A-Za-z]{3}[0-9]{3}$/).required(),
        description: Joi.string().max(200).allow('').optional()
    });
    return schema.validate(course);
}

function validateStudent(student)
{
    const schema = Joi.object({ 
        name: Joi.string().pattern(/^[A-Za-z-']+$/).required(),
        code: Joi.string().length(7).required(),
    });
    return schema.validate(student);
}

function validateCoursePut(course)
{
    const schema = Joi.object({ 
        name: Joi.string().min(5).allow('').optional(),
        code: Joi.string().length(6).pattern(/^[A-Za-z]{3}[0-9]{3}$/).allow('').optional(),
        description: Joi.string().max(200).allow('').optional()
    });
    return schema.validate(course);
}

function validateStudentPut(student)
{
    const schema = Joi.object({ 
        name: Joi.string().pattern(/^[A-Za-z-']+$/).allow('').optional(),
        code: Joi.string().length(7).allow('').optional(),
    });
    return schema.validate(student);
}