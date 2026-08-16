import re
from flask import Blueprint, request, jsonify
from db import execute_query

employee_bp = Blueprint('employee', __name__)

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def format_employee(emp):
    """Formats employee record dictionary to ensure serializable data types."""
    if not emp:
        return None
    emp_dict = dict(emp)
    if 'salary' in emp_dict and emp_dict['salary'] is not None:
        emp_dict['salary'] = float(emp_dict['salary'])
    if 'created_at' in emp_dict and emp_dict['created_at'] is not None:
        emp_dict['created_at'] = str(emp_dict['created_at'])
    if 'updated_at' in emp_dict and emp_dict['updated_at'] is not None:
        emp_dict['updated_at'] = str(emp_dict['updated_at'])
    return emp_dict

def validate_employee_payload(data):
    """Validates input payload for employee creation and updates."""
    if not data or not isinstance(data, dict):
        return "Request body must be a JSON object"

    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip()
    department = str(data.get('department', '')).strip()
    position = str(data.get('position', '')).strip()
    salary = data.get('salary')

    if not name:
        return "Name cannot be empty"

    if not email:
        return "Email cannot be empty"

    if not re.match(EMAIL_REGEX, email):
        return "Invalid email format"

    if not department:
        return "Department cannot be empty"

    if not position:
        return "Position cannot be empty"

    if salary is None:
        return "Salary is required"

    try:
        salary_val = float(salary)
        if salary_val < 0:
            return "Salary must be a non-negative number"
    except (ValueError, TypeError):
        return "Salary must be a valid numeric value"

    return None


@employee_bp.route('/employees', methods=['GET'])
def get_all_employees():
    """Retrieve all employees ordered by latest ID."""
    try:
        rows = execute_query("SELECT * FROM employees ORDER BY id DESC", fetch_all=True)
        employees = [format_employee(row) for row in rows]
        return jsonify(employees), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve employees: {str(e)}"}), 500


@employee_bp.route('/employees/search', methods=['GET'])
def search_employees():
    """Search employees by name, email, department, or position."""
    query = request.args.get('q', '').strip()
    if not query:
        return get_all_employees()

    try:
        search_pattern = f"%{query}%"
        sql = """
            SELECT * FROM employees 
            WHERE name LIKE %s OR email LIKE %s OR department LIKE %s OR position LIKE %s 
            ORDER BY id DESC
        """
        rows = execute_query(sql, (search_pattern, search_pattern, search_pattern, search_pattern), fetch_all=True)
        employees = [format_employee(row) for row in rows]
        return jsonify(employees), 200
    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500


@employee_bp.route('/employees/<int:emp_id>', methods=['GET'])
def get_employee_by_id(emp_id):
    """Retrieve a single employee by ID."""
    try:
        row = execute_query("SELECT * FROM employees WHERE id = %s", (emp_id,), fetch_one=True)
        if not row:
            return jsonify({"error": "Employee not found"}), 404
        return jsonify(format_employee(row)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve employee: {str(e)}"}), 500


@employee_bp.route('/employees', methods=['POST'])
def create_employee():
    """Create a new employee with validation."""
    data = request.get_json(silent=True) or {}
    validation_error = validate_employee_payload(data)
    if validation_error:
        return jsonify({"error": validation_error}), 400

    name = data['name'].strip()
    email = data['email'].strip().lower()
    department = data['department'].strip()
    position = data['position'].strip()
    salary = float(data['salary'])

    try:
        # Check duplicate email
        existing = execute_query("SELECT id FROM employees WHERE email = %s", (email,), fetch_one=True)
        if existing:
            return jsonify({"error": "An employee with this email already exists"}), 400

        new_id = execute_query(
            "INSERT INTO employees (name, email, department, position, salary) VALUES (%s, %s, %s, %s, %s)",
            (name, email, department, position, salary),
            commit=True
        )

        created_emp = execute_query("SELECT * FROM employees WHERE id = %s", (new_id,), fetch_one=True)
        return jsonify(format_employee(created_emp)), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create employee: {str(e)}"}), 500


@employee_bp.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    """Update an existing employee record."""
    try:
        existing = execute_query("SELECT * FROM employees WHERE id = %s", (emp_id,), fetch_one=True)
        if not existing:
            return jsonify({"error": "Employee not found"}), 404

        data = request.get_json(silent=True) or {}
        validation_error = validate_employee_payload(data)
        if validation_error:
            return jsonify({"error": validation_error}), 400

        name = data['name'].strip()
        email = data['email'].strip().lower()
        department = data['department'].strip()
        position = data['position'].strip()
        salary = float(data['salary'])

        # Check email uniqueness for other records
        email_check = execute_query(
            "SELECT id FROM employees WHERE email = %s AND id != %s",
            (email, emp_id),
            fetch_one=True
        )
        if email_check:
            return jsonify({"error": "An employee with this email already exists"}), 400

        execute_query(
            "UPDATE employees SET name = %s, email = %s, department = %s, position = %s, salary = %s WHERE id = %s",
            (name, email, department, position, salary, emp_id),
            commit=True
        )

        updated_emp = execute_query("SELECT * FROM employees WHERE id = %s", (emp_id,), fetch_one=True)
        return jsonify(format_employee(updated_emp)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update employee: {str(e)}"}), 500


@employee_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    """Delete an employee record by ID."""
    try:
        existing = execute_query("SELECT * FROM employees WHERE id = %s", (emp_id,), fetch_one=True)
        if not existing:
            return jsonify({"error": "Employee not found"}), 404

        execute_query("DELETE FROM employees WHERE id = %s", (emp_id,), commit=True)
        return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete employee: {str(e)}"}), 500
