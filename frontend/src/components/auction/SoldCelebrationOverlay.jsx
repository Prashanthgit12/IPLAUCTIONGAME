import React, { useEffect } from 'react';
import { formatPurse } from '../../utils/formatters';
import TeamLogo from '../common/TeamLogo';

const SoldCelebrationOverlay = ({ celebration, onClose }) => {
  if (!celebration) return null;

  const { player, team, soldPrice } = celebration;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 6, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-card sold-stamp-anim text-center p-4 p-md-5 position-relative"
        style={{
          maxWidth: '540px',
          width: '100%',
          background: 'linear-gradient(180deg, rgba(16, 28, 52, 0.98) 0%, rgba(6, 11, 23, 0.98) 100%)',
          border: '2px solid rgba(255, 179, 0, 0.5)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), var(--neon-gold-glow)',
          borderRadius: '24px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        {/* Dramatic SOLD! Banner */}
        <div
          className="display-title mb-3"
          style={{
            fontSize: '3.6rem',
            fontWeight: '900',
            letterSpacing: '0.08em',
            background: 'var(--gold-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255, 179, 0, 0.6)',
            lineHeight: 1
          }}
        >
          SOLD!
        </div>

        {/* Player Image & Name */}
        <div className="my-3">
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              padding: '4px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #ffb300 100%)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
            }}
          >
            <img
              src={player.image || '/players/virat-kohli.jpg'}
              alt={player.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
              onError={(e) => {
                e.target.src = '/logos/ipl.svg';
              }}
            />
          </div>

          <h3 className="text-white font-display fw-bold mb-1" style={{ fontSize: '1.8rem' }}>
            {player.name}
          </h3>
          <span className="badge badge-batter mb-3">
            {player.role} • {player.country}
          </span>
        </div>

        {/* Winning Franchise Box */}
        <div
          className="glass-panel p-3 mb-4 mx-auto"
          style={{
            maxWidth: '400px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${team.primaryColor || 'rgba(0, 240, 255, 0.3)'}`
          }}
        >
          <div className="text-secondary mb-1" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
            Winning Franchise
          </div>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <TeamLogo team={team} size={36} />
            <span className="text-white fw-bold font-display" style={{ fontSize: '1.3rem' }}>
              {team.name}
            </span>
          </div>
        </div>

        {/* Winning Bid Price */}
        <div className="mb-4">
          <div className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Final Bid Amount
          </div>
          <div
            className="font-display fw-bold"
            style={{
              fontSize: '2.5rem',
              color: '#00e676',
              textShadow: '0 0 20px rgba(0, 230, 118, 0.5)'
            }}
          >
            {formatPurse(soldPrice)}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="btn btn-premium-gold px-5 py-2"
          style={{ fontSize: '1rem', borderRadius: '30px' }}
        >
          Continue Auction <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  );
};

export default SoldCelebrationOverlay;
