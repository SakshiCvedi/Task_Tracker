# Task_Tracker

# Team Task Tracker

A full-stack team task management application built as part of an SDE II take-home assignment.

The application enables organizations to manage projects and tasks with role-based access control. It includes a TypeScript/Node.js backend, PostgreSQL database managed through Prisma ORM, Redis integration, Docker support, and a React + Vite frontend.

---

## Tech Stack

### Backend

* Node.js
* TypeScript
* Express.js
* Prisma ORM
* PostgreSQL
* Redis
* JWT Authentication
* Zod Validation

### Frontend

* React
* TypeScript
* Vite
* Axios
* React Router

### DevOps

* Docker
* Docker Compose

---

## Features Implemented

### Authentication

* User Registration
* User Login
* JWT-based Authentication
* Protected Routes
* Password Hashing using bcrypt

### Role Based Access Control (RBAC)

Supported roles:

* ADMIN
* MANAGER
* MEMBER

RBAC is enforced using middleware and not inside controller logic.

Current permissions:

| Role    | Permissions                                          |
| ------- | ---------------------------------------------------- |
| ADMIN   | Manage users, projects, and tasks                    |
| MANAGER | Manage projects and tasks                            |
| MEMBER  | Access assigned resources based on role restrictions |

---

## Project Management

Implemented:

* Create Project
* Get All Projects
* Get Project By ID
* Update Project
* Delete Project

Projects are organization-scoped and protected through authentication and authorization middleware.

---

## Task Management

Implemented:

* Create Task
* View Tasks
* Task Assignment
* Filtering Support
* Pagination Support

Task data includes:

* Title
* Description
* Priority
* Status
* Assignee
* Due Date

---

## User Management

Implemented:

* User Retrieval APIs
* Organization-level User Access
* Role-aware Authorization

---

## Validation & Error Handling

Input validation is implemented using Zod schemas.

Consistent API error format:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed"
}
```

Global error handling middleware is used across the application.

---

## Database Design

### ORM

Prisma ORM

### Main Entities

#### Organization

* id
* name

#### User

* id
* firstName
* lastName
* email
* password
* role
* organizationId

#### Project

* id
* name
* description
* organizationId

#### Task

* id
* title
* description
* priority
* status
* dueDate
* assigneeId
* projectId

### Design Decision

Projects and users are linked through an organization relationship.

This structure ensures strict data isolation between organizations and simplifies authorization checks by allowing queries to be scoped at the organization level rather than performing complex permission checks across unrelated records.

---

## Redis Caching

Redis integration has been configured and connected successfully.

Current implementation includes:

* Redis connection management
* Foundation for caching task-related data

Future enhancement:

* Cache task lists per assignee
* Implement automatic cache invalidation on task updates

---

## Docker Support

The project includes:

* Dockerfile
* docker-compose.yml

### Run with Docker

```bash
docker compose up --build
```

---

## Local Development Setup

### Backend

```bash
npm install
npm run dev
```

### Frontend

```bash
cd task-tracker-ui

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:3000
```

---

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

```http
GET /api/users
GET /api/users/:userId
```

### Projects

```http
GET /api/projects
GET /api/projects/:projectId
POST /api/projects
PATCH /api/projects/:projectId
DELETE /api/projects/:projectId
```

### Tasks

```http
GET /api/tasks
GET /api/tasks/:taskId
POST /api/tasks
PATCH /api/tasks/:taskId
DELETE /api/tasks/:taskId
```

---

## Current Limitations

The following assignment requirements are partially implemented or planned for future work:

* Refresh Token Rotation
* Task Status Transition Rules
* Redis Task List Caching
* Cache Invalidation Strategy
* Analytics Endpoint
* Real-time Notifications
* Automated Unit/Integration Tests
* Swagger/OpenAPI Documentation

---

## Future Improvements

Given additional development time, I would prioritize:

1. Refresh token rotation and secure token revocation.
2. Redis caching for task listing endpoints with invalidation strategy.
3. Enforced task workflow transitions.
4. Comprehensive unit and integration testing.
5. Swagger/OpenAPI documentation.
6. Activity logs and audit trail.
7. Real-time task update notifications using WebSockets.
8. Enhanced dashboard analytics and reporting.

---

## Author

Sakshi Chaturvedi

Associate Software Engineer | Accenture

B.Tech, Computer Science & Engineering
