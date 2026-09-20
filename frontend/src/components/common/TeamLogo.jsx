import React from 'react';

const TeamLogo = ({ team, size = 32, style = {}, className = '' }) => {
  if (!team) return <span>🏏</span>;

  const logoSrc = team.logo || `/logos/${(team.shortName || 'ipl').toLowerCase()}.svg`;
  const isImage = typeof logoSrc === 'string' && (
    logoSrc.startsWith('http') ||
    logoSrc.startsWith('/') ||
    logoSrc.includes('.svg') ||
    logoSrc.includes('.png') ||
    logoSrc.includes('.jpg')
  );

  if (isImage) {
    return (
      <img
        src={logoSrc}
        alt={team.name || team.shortName || 'Team'}
        className={`team-logo-img ${className}`}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
          verticalAlign: 'middle',
          display: 'inline-block',
          ...style
        }}
        onError={(e) => {
          const fallback = `/logos/${(team.shortName || 'ipl').toLowerCase()}.svg`;
          if (e.target.src !== fallback) {
            e.target.src = fallback;
          }
        }}
      />
    );
  }

  return (
    <span style={{ fontSize: typeof size === 'number' ? `${size * 0.8}px` : size, ...style }} className={className}>
      {logoSrc || '🏏'}
    </span>
  );
};

export default TeamLogo;
