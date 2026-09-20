import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/auction-control', icon: 'bi-broadcast', label: 'Live Control' },
    { path: '/admin/players', icon: 'bi-person-badge', label: 'Manage Players' },
    { path: '/admin/teams', icon: 'bi-shield-shaded', label: 'Manage Teams' }
  ];

  return (
    <div
      className="glass-card p-3 h-100"
      style={{
        borderRadius: '16px',
        minHeight: '400px'
      }}
    >
      <div className="d-flex align-items-center gap-2 px-3 py-2 mb-3 border-bottom border-secondary border-opacity-25">
        <span className="text-warning fs-5">⚙️</span>
        <span className="font-display fw-bold text-white" style={{ fontSize: '1rem' }}>
          AUCTION CONTROL
        </span>
      </div>

      <ul className="nav nav-pills flex-column gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className="nav-link d-flex align-items-center gap-3 py-2 px-3"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(41, 121, 255, 0.2) 100%)' : 'transparent',
                  color: isActive ? '#00f0ff' : '#94a3b8',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                  borderRadius: '10px',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 px-2">
        <Link to="/live" className="btn btn-sm btn-premium-glass w-100 mb-2">
          <i className="bi bi-eye me-1"></i> View Live Auction
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
