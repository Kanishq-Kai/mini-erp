import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};
