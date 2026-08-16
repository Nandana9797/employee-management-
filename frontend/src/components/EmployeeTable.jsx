import React from 'react';
import { Edit2, Trash2, Users, SearchX } from 'lucide-react';

export default function EmployeeTable({ employees, onEdit, onDelete, searchQuery }) {
  if (employees.length === 0) {
    return (
      <div className="state-container">
        {searchQuery ? (
          <>
            <SearchX className="state-icon" />
            <h4 className="state-title">No matching employees found</h4>
            <p className="state-desc">
              No results found for "<strong>{searchQuery}</strong>". Try searching with a different keyword or clearance level.
            </p>
          </>
        ) : (
          <>
            <Users className="state-icon" />
            <h4 className="state-title">No employees registered yet</h4>
            <p className="state-desc">Get started by clicking the "Add Employee" button above.</p>
          </>
        )}
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="table-responsive">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>
                <div className="emp-name-cell">
                  <div className="avatar">{getInitials(emp.name)}</div>
                  <div>
                    <strong style={{ display: 'block' }}>{emp.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: #{emp.id}</span>
                  </div>
                </div>
              </td>
              <td>{emp.email}</td>
              <td>
                <span className="dept-badge">{emp.department}</span>
              </td>
              <td>{emp.position}</td>
              <td style={{ fontWeight: 600, color: '#38bdf8' }}>{formatCurrency(emp.salary)}</td>
              <td>
                <div className="actions-cell">
                  <button
                    className="btn btn-secondary btn-icon-only"
                    onClick={() => onEdit(emp)}
                    title="Edit Employee"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-danger btn-icon-only"
                    onClick={() => onDelete(emp.id)}
                    title="Delete Employee"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
