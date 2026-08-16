import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Server
} from 'lucide-react';
import * as api from './api';
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import Toast from './components/Toast';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHealthy, setIsHealthy] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check health status
  const checkHealthStatus = async () => {
    try {
      await api.checkHealth();
      setIsHealthy(true);
    } catch {
      setIsHealthy(false);
    }
  };

  // Fetch Employees from backend API
  const fetchEmployees = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (query.trim()) {
        data = await api.searchEmployees(query.trim());
      } else {
        data = await api.getEmployees();
      }
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealthStatus();
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced Search Handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchEmployees(query);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setCurrentEmployee(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (employee) => {
    setCurrentEmployee(employee);
    setIsModalOpen(true);
  };

  // Save (Create or Update) Employee
  const handleSaveEmployee = async (formData) => {
    setIsSubmitting(true);
    try {
      if (currentEmployee) {
        // Update existing
        await api.updateEmployee(currentEmployee.id, formData);
        showToast('Employee updated successfully!', 'success');
      } else {
        // Create new
        await api.createEmployee(formData);
        showToast('Employee created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchEmployees(searchQuery);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    try {
      await api.deleteEmployee(id);
      showToast('Employee deleted successfully', 'success');
      fetchEmployees(searchQuery);
    } catch (err) {
      showToast(err.message || 'Failed to delete employee', 'error');
    }
  };

  // Calculate stats summary
  const totalEmployees = employees.length;
  const totalPayroll = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);
  const uniqueDepartments = new Set(employees.map((emp) => emp.department)).size;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <Users size={24} />
          </div>
          <div>
            <h1 className="brand-title">Employee Management</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              REST API & Database Powered Directory
            </p>
          </div>
        </div>

        <div className="header-status">
          <Server size={14} />
          <span>Backend API:</span>
          {isHealthy === true && (
            <>
              <span className="status-dot healthy"></span>
              <strong style={{ color: 'var(--status-success)' }}>Healthy</strong>
            </>
          )}
          {isHealthy === false && (
            <>
              <span className="status-dot error"></span>
              <strong style={{ color: 'var(--status-error)' }}>Offline / Error</strong>
            </>
          )}
          {isHealthy === null && <span>Checking...</span>}
        </div>
      </header>

      {/* Error Alert Banner */}
      {error && (
        <div className="alert-banner error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-icon-only" onClick={() => fetchEmployees(searchQuery)}>
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* Summary Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Employees</span>
            <div className="stat-value">{totalEmployees}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ color: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Departments</span>
            <div className="stat-value">{uniqueDepartments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Payroll</span>
            <div className="stat-value">
              ${totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, department, or position..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {loading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <h4 className="state-title">Loading employees...</h4>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteEmployee}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveEmployee}
        employee={currentEmployee}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
