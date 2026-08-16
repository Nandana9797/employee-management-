import os
import sys
from pathlib import Path

import pytest

# Ensure testing environment flag is active before importing app
os.environ["TESTING"] = "true"

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app  #noqa: E042


@pytest.fixture
def client():
    """Create Flask test client configured for isolated unit testing."""
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


def test_health_endpoint(client):
    """Test GET /api/health returns 200 OK and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"status": "healthy"}


def test_get_all_employees(client):
    """Test GET /api/employees returns a list of employees."""
    response = client.get("/api/employees")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)


def test_create_employee_success(client):
    """Test POST /api/employees creates a valid employee."""
    payload = {
        "name": "Test User",
        "email": "test.user@example.com",
        "department": "QA",
        "position": "Automation Tester",
        "salary": 75000.00,
    }
    response = client.post("/api/employees", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Test User"
    assert data["email"] == "test.user@example.com"


def test_create_employee_validation_errors(client):
    """Test POST /api/employees fails when validation rules are broken."""
    # Test empty name
    resp1 = client.post(
        "/api/employees",
        json={
            "name": "",
            "email": "valid@example.com",
            "department": "Dev",
            "position": "Lead",
            "salary": 50000,
        },
    )
    assert resp1.status_code == 400
    assert "Name cannot be empty" in resp1.get_json()["error"]

    # Test invalid email format
    resp2 = client.post(
        "/api/employees",
        json={
            "name": "John",
            "email": "invalid-email",
            "department": "Dev",
            "position": "Lead",
            "salary": 50000,
        },
    )
    assert resp2.status_code == 400
    assert "Invalid email format" in resp2.get_json()["error"]

    # Test negative salary
    resp3 = client.post(
        "/api/employees",
        json={
            "name": "John",
            "email": "john@example.com",
            "department": "Dev",
            "position": "Lead",
            "salary": -100,
        },
    )
    assert resp3.status_code == 400
    assert "Salary must be a non-negative number" in resp3.get_json()["error"]


def test_update_employee(client):
    """Test PUT /api/employees/<id> updates employee details."""
    # Create employee to update
    create_resp = client.post(
        "/api/employees",
        json={
            "name": "Update Target",
            "email": "target.update@example.com",
            "department": "Support",
            "position": "Junior Agent",
            "salary": 45000.00,
        },
    )
    emp_id = create_resp.get_json()["id"]

    # Update employee
    update_payload = {
        "name": "Updated Target",
        "email": "target.update@example.com",
        "department": "Support Ops",
        "position": "Senior Agent",
        "salary": 55000.00,
    }
    update_resp = client.put(f"/api/employees/{emp_id}", json=update_payload)
    assert update_resp.status_code == 200
    updated_data = update_resp.get_json()
    assert updated_data["name"] == "Updated Target"
    assert updated_data["position"] == "Senior Agent"


def test_search_employee(client):
    """Test GET /api/employees/search?q=<query> filters employees."""
    client.post(
        "/api/employees",
        json={
            "name": "Unique Searchable Name",
            "email": "unique.search@example.com",
            "department": "Special Projects",
            "position": "Architect",
            "salary": 120000.00,
        },
    )
    response = client.get("/api/employees/search?q=Unique")
    assert response.status_code == 200
    results = response.get_json()
    assert len(results) >= 1
    assert any(emp["name"] == "Unique Searchable Name" for emp in results)


def test_delete_employee(client):
    """Test DELETE /api/employees/<id> removes employee."""
    # Create employee to delete
    create_resp = client.post(
        "/api/employees",
        json={
            "name": "Delete Target",
            "email": "delete.target@example.com",
            "department": "Security",
            "position": "Auditor",
            "salary": 60000.00,
        },
    )
    emp_id = create_resp.get_json()["id"]

    # Delete employee
    del_resp = client.delete(f"/api/employees/{emp_id}")
    assert del_resp.status_code == 200
    assert del_resp.get_json()["message"] == "Employee deleted successfully"

    # Verify 404 when requesting deleted employee
    get_resp = client.get(f"/api/employees/{emp_id}")
    assert get_resp.status_code == 404
