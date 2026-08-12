import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="header">
      <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-main)' }}>
        Welcome, {user.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="badge badge-success">{user.role}</span>
        <button onClick={logout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
