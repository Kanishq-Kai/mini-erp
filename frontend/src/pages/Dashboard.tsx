import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card glass">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Welcome Back</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{user?.name}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Your Role</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'inline-block' }} className="badge badge-success">{user?.role}</p>
        </div>
      </div>
      <div style={{ marginTop: '2rem' }} className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Links</h2>
        <p style={{ color: 'var(--text-muted)' }}>Use the sidebar to navigate to different modules based on your role.</p>
      </div>
    </div>
  );
};

export default Dashboard;
