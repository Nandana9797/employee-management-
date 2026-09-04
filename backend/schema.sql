-- Database Initialization Schema for Employee Management System

CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial sample data
INSERT INTO employees (name, email, department, position, salary) VALUES
('Alice Johnson', 'alice.johnson@example.com', 'Engineering', 'Senior Developer', 95000.00),
('Bob Smith', 'bob.smith@example.com', 'Marketing', 'Marketing Specialist', 62000.00),
('Carol White', 'carol.white@example.com', 'Human Resources', 'HR Manager', 78000.00),
('David Lee', 'david.lee@example.com', 'Finance', 'Financial Analyst', 70000.00),
('Eva Martinez', 'eva.martinez@example.com', 'Engineering', 'DevOps Engineer', 88000.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);
