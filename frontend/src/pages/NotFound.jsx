import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 20px'
      }}
    >
      <div className="glass-card p-5" style={{ maxWidth: '500px' }}>
        <h1 className="font-display fw-bold text-info" style={{ fontSize: '5rem', lineHeight: 1 }}>
          404
        </h1>
        <h3 className="text-white font-display fw-bold mb-3">Page Not Found</h3>
        <p className="text-secondary mb-4">
          The pitch you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-premium-accent">
          Return To Home Pitch
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
