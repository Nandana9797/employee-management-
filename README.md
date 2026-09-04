# Containerized Employee Management System - Application Code

A clean, full-stack Employee Management System built with Python (Flask) REST API, MySQL database support, and a React (Vite) frontend.

> ⚠️ **DevOps Note**: This repository contains the application source code only. Docker containerization (`Dockerfile`, `docker-compose.yml`), Nginx reverse proxy configurations, and CI/CD GitHub Actions workflows will be added separately in a future DevOps phase.

---

## Table of Contents

- [Overview & Features](#overview--features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup (MySQL)](#database-setup-mysql)
- [Backend Setup & Execution](#backend-setup--execution)
- [Frontend Setup & Execution](#frontend-setup--execution)
- [API Documentation](#api-documentation)
- [Running Automated Tests](#running-automated-tests)
- [Known Limitations](#known-limitations)

---

## Overview & Features

The Employee Management System provides a complete CRUD dashboard to manage organization staff details:

1. **Employee Listing**: View all registered employees with ID, email, department badge, position, and formatted salary.
2. **Add Employee**: Create new records with backend and client-side validation rules.
3. **Update Employee**: Edit existing employee details with instant table updates.
4. **Delete Employee**: Safely remove employee records.
5. **Search Employees**: Filter records in real time by name, email, department, or position.
6. **Health Check Endpoint**: Dedicated `/api/health` endpoint returning `{"status": "healthy"}` for monitoring backend availability independently of the UI.

---

## Tech Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (CSS Custom Properties, Responsive Layout)

### Backend
- **Framework**: Python / Flask
- **CORS**: Flask-CORS
- **Database Connector**: PyMySQL (with automatic fallback handling for local isolated execution)
- **Environment Management**: python-dotenv
- **Testing**: Pytest

### Database
- **Engine**: MySQL 8.0+

---

## Project Structure

```
employee-mgmt/
│
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── config.py               # Environment configuration loader
│   ├── db.py                   # PyMySQL database helper layer
│   ├── requirements.txt        # Backend dependencies
│   ├── schema.sql              # Database schema & sample seed data
│   ├── routes/
│   │   ├── employee_routes.py  # Employee CRUD endpoints
│   │   └── health_routes.py    # GET /api/health endpoint
│   └── tests/
│       └── test_api.py         # Pytest API test suite
│
├── frontend/
│   ├── index.html              # HTML entry template
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite server settings
│   └── src/
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Main dashboard container & state
│       ├── api.js              # REST API fetch wrapper
│       ├── index.css           # Global design system & theme
│       └── components/
│           ├── EmployeeTable.jsx# Employee listing table & row actions
│           ├── EmployeeModal.jsx# Add / Edit modal form with validation
│           └── Toast.jsx        # Notification banner component
│
├── nginx/
│   └── README.md               # Nginx configuration placeholder
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Default variable settings:

```env
# Database Credentials
DB_HOST=localhost
DB_PORT=3306
DB_NAME=employee_db
DB_USER=employee_user
DB_PASSWORD=change_me

# Backend Port
PORT=5000

# Frontend API Endpoint Configuration
VITE_API_URL=http://localhost:5000/api
```

> **Security Note**: Never commit your actual `.env` file containing secrets to source control. `.env` is listed in `.gitignore`.

---

## Database Setup (MySQL)

To set up MySQL locally:

1. Ensure MySQL server is running locally on port `3306`.
2. Connect using MySQL client:
   ```bash
   mysql -u root -p
   ```
3. Create database user and database using `backend/schema.sql`:
   ```sql
   CREATE DATABASE IF NOT EXISTS employee_db;
   CREATE USER IF NOT EXISTS 'employee_user'@'localhost' IDENTIFIED BY 'change_me';
   GRANT ALL PRIVILEGES ON employee_db.* TO 'employee_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. Run the initialization schema script:
   ```bash
   mysql -u employee_user -p employee_db < backend/schema.sql
   ```

---

## Backend Setup & Execution

1. Navigate to `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask dev server:
   ```bash
   python app.py
   ```
   The backend API will run at `http://localhost:5000/api`.

---

## Frontend Setup & Execution

1. Navigate to `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:3000`.

---

## API Documentation

### Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Returns server health status |
| **GET** | `/api/employees` | List all employees |
| **GET** | `/api/employees/search?q=<query>` | Search employees by name/email/dept/position |
| **GET** | `/api/employees/<id>` | Get single employee details |
| **POST** | `/api/employees` | Create a new employee |
| **PUT** | `/api/employees/<id>` | Update employee record |
| **DELETE** | `/api/employees/<id>` | Delete employee record |

### Example API Requests

#### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```
**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

#### 2. Create Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "department": "Engineering",
    "position": "Software Engineer",
    "salary": 92000.00
  }'
```

#### 3. Search Employees
```bash
curl -X GET "http://localhost:5000/api/employees/search?q=Engineering"
```

---

## Running Automated Tests

Run backend Pytest suite:

```bash
cd backend
pytest
```

---

## Known Limitations

- User authentication / JWT login is omitted as requested.
- Containerization (Docker, docker-compose, Nginx configuration) will be configured in the next phase.
