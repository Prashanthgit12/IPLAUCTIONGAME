import React from 'react';
import { formatPurse, getRoleBadgeClass, getRoleName } from '../../utils/formatters';

const AuctionPlayerCard = ({ player }) => {
  if (!player) {
    return (
      <div className="glass-card p-5 text-center">
        <div style={{ fontSize: '3rem' }}>🏏</div>
        <h4 className="text-white font-display fw-bold mt-3">Awaiting Next Player</h4>
        <p className="text-secondary mb-0">The auctioneer will bring the next player to the block shortly.</p>
      </div>
    );
  }

  const fallbackImage = '/logos/ipl.svg';

  return (
    <div className="broadcast-card h-100 d-flex flex-column">
      {/* Top Banner Tag */}
      <div
        className="d-flex align-items-center justify-content-between p-3"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className={`badge-role ${getRoleBadgeClass(player.role)}`}>
            {getRoleName(player.role)}
          </span>
          <span
            style={{
              background: player.category === 'MARQUEE' ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.1)',
              color: player.category === 'MARQUEE' ? '#000' : '#fff',
              fontWeight: '800',
              fontSize: '0.7rem',
              padding: '3px 8px',
              borderRadius: '4px'
            }}
          >
            {player.auctionSet ? `${player.auctionSet} • ` : ''}
            {player.isCapped === false ? 'UNCAPPED' : player.category}
          </span>
        </div>

        <div className="text-secondary" style={{ fontSize: '0.82rem', fontWeight: '600' }}>
          {player.country} {player.isOverseas && '✈️'}
        </div>
      </div>

      {/* Main Player Visual & Bio */}
      <div className="row g-0 flex-grow-1">
        {/* Left Column: Portrait */}
        <div className="col-md-5 position-relative overflow-hidden" style={{ minHeight: '260px' }}>
          <img
            src={player.image || fallbackImage}
            alt={player.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center'
            }}
            onError={(e) => {
              if (!e.target.dataset.failed) {
                e.target.dataset.failed = 'true';
                e.target.src = fallbackImage;
                e.target.style.objectFit = 'contain';
                e.target.style.padding = '30px';
              }
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 60%, rgba(9, 17, 34, 0.95) 100%)'
            }}
            className="d-none d-md-block"
          ></div>
        </div>

        {/* Right Column: Key Details & Stats */}
        <div className="col-md-7 p-3 p-md-4 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className={`badge-role ${getRoleBadgeClass(player.role)}`}>
                {getRoleName(player.role)}
              </span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Age: {player.age || 25} Yrs
              </span>
            </div>

            <h2 className="text-white font-display fw-bold mb-3" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
              {player.name}
            </h2>

            {/* Styles Breakdown */}
            <div className="glass-panel p-2 mb-3" style={{ fontSize: '0.82rem' }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-secondary">Batting Style:</span>
                <span className="text-white fw-semibold">{player.battingStyle || 'Right-hand bat'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Bowling Style:</span>
                <span className="text-white fw-semibold">{player.bowlingStyle || 'None'}</span>
              </div>
            </div>

            {/* Career Performance Grid */}
            <div className="row g-2 text-center mb-3">
              <div className="col-3">
                <div className="glass-panel p-2">
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>MATCHES</div>
                  <div className="text-white fw-bold font-display" style={{ fontSize: '1rem' }}>
                    {player.stats?.matches || 0}
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="glass-panel p-2">
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>RUNS</div>
                  <div className="text-white fw-bold font-display" style={{ fontSize: '1rem' }}>
                    {player.stats?.runs || 0}
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="glass-panel p-2">
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>WICKETS</div>
                  <div className="text-white fw-bold font-display" style={{ fontSize: '1rem' }}>
                    {player.stats?.wickets || 0}
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="glass-panel p-2">
                  <div className="text-secondary" style={{ fontSize: '0.68rem' }}>S / RATE</div>
                  <div className="text-info fw-bold font-display" style={{ fontSize: '1rem' }}>
                    {player.stats?.strikeRate || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base Price Bar */}
          <div
            className="p-3 d-flex align-items-center justify-content-between"
            style={{
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div>
              <div className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Base Price
              </div>
              <div className="text-info font-display fw-bold" style={{ fontSize: '1.25rem' }}>
                {formatPurse(player.basePrice)}
              </div>
            </div>

            <div className="text-end">
              <div className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Player Category
              </div>
              <div className="text-white font-display fw-semibold" style={{ fontSize: '0.95rem' }}>
                {player.category}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPlayerCard;
