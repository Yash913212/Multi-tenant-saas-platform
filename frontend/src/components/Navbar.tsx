import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="brand">
        <span className="brand-dot" />
        <span>TaskNest</span>
      </div>
      {user && (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          {user.role !== 'user' && <Link to="/tasks">Tasks</Link>}
          {user.role === 'tenant_admin' && <Link to="/users">Users</Link>}
          {user.role === 'super_admin' && <Link to="/tenants">Tenants</Link>}
          <span className="muted">{user.fullName || user.email} ({user.role})</span>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Navbar;