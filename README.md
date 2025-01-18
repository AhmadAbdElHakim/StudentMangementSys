# Student Management System

## Prerequisites
- Node.js
- npm (Node Package Manager)

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/StudentMangementSys.git
    ```
2. Navigate to the project directory:
    ```bash
    cd StudentMangementSys
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Running the Application
1. Start the server:
    ```bash
    node index.js
    ```
2. Open your browser and navigate to:
    ```
    http://localhost:3000
    ```

## API Endpoints
- `GET /api/courses` - Retrieve all courses
- `GET /api/courses/:id` - Retrieve a course by ID
- `POST /api/courses` - Add a new course
- `PUT /api/courses/:id` - Update a course by ID
- `DELETE /api/courses/:id` - Delete a course by ID

- `GET /api/students` - Retrieve all students
- `GET /api/students/:id` - Retrieve a student by ID
- `POST /api/students` - Add a new student
- `PUT /api/students/:id` - Update a student by ID
- `DELETE /api/students/:id` - Delete a student by ID
