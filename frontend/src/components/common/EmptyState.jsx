import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-folder-x',
  title = 'No records found',
  description = 'There are no items matching your criteria at this time.',
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div
      className="glass-card text-center p-5 mx-auto"
      style={{
        maxWidth: '500px',
        margin: '40px auto'
      }}
    >
      <div
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}
      >
        <i className={`bi ${icon} fs-1 text-info`}></i>
      </div>
      <h4 className="text-white fw-bold mb-2 font-display">{title}</h4>
      <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
        {description}
      </p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-premium-accent">
            {actionText}
          </Link>
        ) : (
          <button onClick={onActionClick} className="btn btn-premium-accent">
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
