import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Package, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        Mini ERP
      </div>
      <div className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={18} /> Dashboard
          </span>
        </NavLink>
        {(user.role === 'ADMIN' || user.role === 'SALES') && (
          <NavLink to="/customers" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} /> Customers
            </span>
          </NavLink>
        )}
        {(user.role === 'ADMIN' || user.role === 'WAREHOUSE' || user.role === 'SALES') && (
          <NavLink to="/products" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} /> Inventory
            </span>
          </NavLink>
        )}
        {(user.role === 'ADMIN' || user.role === 'SALES') && (
          <NavLink to="/challans" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} /> Sales Challan
            </span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
