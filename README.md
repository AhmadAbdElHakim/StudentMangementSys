# Learning Management System

## Features

### Views
- **Home Page** <br/> <br/> <img width="1277" alt="Image" src="https://github.com/user-attachments/assets/5d353d6b-506b-4dd1-977e-01714edc9f92" />
- **Statistics** <br/> <br/> <img width="1267" alt="Image" src="https://github.com/user-attachments/assets/4b00ec97-2f55-40b8-bba0-fe10d723acfe" />
- **View Staff** <br/> <br/> <img width="1264" alt="Image" src="https://github.com/user-attachments/assets/ebd8df36-9d4d-4904-bf4e-d812f3bfe690" />
- **View Courses** <br/> <br/> <img width="1266" alt="Image" src="https://github.com/user-attachments/assets/ba083de7-e224-429f-b0d1-6f9002e0bc75" />
- **View Students** <br/> <br/> <img width="1265" alt="Image" src="https://github.com/user-attachments/assets/c8fa07af-3a9d-402c-8dfc-1e98edc25c34" />

### Creation and Update
- **Create Course** <br/> <br/> <img width="1265" alt="Image" src="https://github.com/user-attachments/assets/82975c1a-18cf-4cec-a2c6-58512eec4b2b" />
- **Update Staff** <br/> <br/> <img width="1267" alt="Image" src="https://github.com/user-attachments/assets/6330d1e1-85d8-4003-a659-e170c0621909" />

## Schema
![Image](https://github.com/user-attachments/assets/bfb0b87b-c501-4138-8352-0bf0abb9cf69)

## Prerequisites
- Node.js
- npm (Node Package Manager)
- PostgreSQL

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

## Database Setup
1. Create a PostgreSQL database and user.
2. Execute the `schema.sql` file to create the necessary tables:
    ```bash
    psql -U yourusername -d yourdatabase -f schema.sql
    ```
3. Update `.env` file and add your database connection details or set them as environment variables in the service app:
    ```dotenv
    DB_HOST="your_postgresql_host"
    DB_USER="your_postgresql_user"
    DB_PASSWORD="your_postgresql_password"
    DB_NAME="your_postgresql_database"
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
