import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span>{message}</span>
      <button className="close-btn" onClick={onClose} style={{ marginLeft: 'auto' }}>
        <X size={14} />
      </button>
    </div>
  );
}
