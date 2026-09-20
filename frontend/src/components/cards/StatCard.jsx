import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon = 'bi-activity',
  accentColor = '#00f0ff',
  badgeText
}) => {
  return (
    <div className="glass-card p-3 p-md-4 h-100 position-relative overflow-hidden">
      {/* Background soft glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: accentColor,
          opacity: 0.12,
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}
      ></div>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <span
          className="text-secondary fw-semibold text-uppercase"
          style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}
        >
          {title}
        </span>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `rgba(${accentColor === '#00f0ff' ? '0,240,255,0.15' : '255,179,0,0.15'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor
          }}
        >
          <i className={`bi ${icon} fs-5`}></i>
        </div>
      </div>

      <div className="d-flex align-items-baseline gap-2">
        <h3
          className="text-white fw-bold font-display mb-0"
          style={{ fontSize: '1.75rem' }}
        >
          {value}
        </h3>
        {badgeText && (
          <span
            className="badge"
            style={{
              background: 'rgba(0, 230, 118, 0.15)',
              color: '#00e676',
              fontSize: '0.72rem'
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-muted mt-2" style={{ fontSize: '0.78rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
