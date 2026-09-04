import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, onSubmit, employee = null, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    position: '',
    salary: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || 'Engineering',
        position: employee.position || '',
        salary: employee.salary !== undefined ? employee.salary : '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Engineering',
        position: '',
        salary: '',
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.department.trim()) errs.department = 'Department is required';
    if (!formData.position.trim()) errs.position = 'Position is required';
    if (formData.salary === '' || formData.salary === null) {
      errs.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || Number(formData.salary) < 0) {
      errs.salary = 'Salary must be a non-negative number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        salary: parseFloat(formData.salary),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="e.g. john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="e.g. Engineering, Marketing, Finance"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <div className="form-error">{errors.department}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Position / Job Title *</label>
              <input
                type="text"
                name="position"
                className="form-input"
                placeholder="e.g. Software Engineer"
                value={formData.position}
                onChange={handleChange}
              />
              {errors.position && <div className="form-error">{errors.position}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Annual Salary ($) *</label>
              <input
                type="number"
                name="salary"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="e.g. 75000"
                value={formData.salary}
                onChange={handleChange}
              />
              {errors.salary && <div className="form-error">{errors.salary}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
