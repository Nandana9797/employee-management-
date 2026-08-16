// Base URL configurable via VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
}

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

export const getEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employees`);
  return handleResponse(response);
};

export const searchEmployees = async (query) => {
  const response = await fetch(`${API_BASE_URL}/employees/search?q=${encodeURIComponent(query)}`);
  return handleResponse(response);
};

export const getEmployee = async (id) => {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`);
  return handleResponse(response);
};

export const createEmployee = async (employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return handleResponse(response);
};

export const updateEmployee = async (id, employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });
  return handleResponse(response);
};

export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};
