import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@minierp.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Login to Mini ERP</h2>
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', background: '#fff' }}>
              <Mail size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ border: 'none', padding: 0, width: '100%', outline: 'none' }} 
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', background: '#fff' }}>
              <Lock size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ border: 'none', padding: 0, width: '100%', outline: 'none' }} 
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem' }}>Sign In</button>
        </form>
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5' }}>
          Test Accounts:<br/>
          admin@minierp.com<br/>
          sales@minierp.com<br/>
          warehouse@minierp.com<br/>
          (Password for all: password123)
        </div>
      </div>
    </div>
  );
};

export default Login;
