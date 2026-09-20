import React from 'react';
import { Link } from 'react-router-dom';
import { formatPurse, getRoleBadgeClass, getRoleName, getStatusBadge } from '../../utils/formatters';
import { useWishlist } from '../../context/WishlistContext';

const PlayerCard = ({ player }) => {
  if (!player) return null;

  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(player._id);
  const statusInfo = getStatusBadge(player.status);
  const fallbackImage = '/logos/ipl.svg';

  return (
    <div className="glass-card glass-card-interactive h-100 d-flex flex-column overflow-hidden position-relative">
      {/* Target Board Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(player);
        }}
        title={wishlisted ? 'Remove from Target Board' : 'Add to Target Board (Wishlist)'}
        style={{
          position: 'absolute',
          top: '46px',
          right: '12px',
          zIndex: 3,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: wishlisted ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.2)',
          background: wishlisted ? '#ffd700' : 'rgba(0, 0, 0, 0.6)',
          color: wishlisted ? '#000' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease'
        }}
      >
        <i className={`bi ${wishlisted ? 'bi-bookmark-star-fill' : 'bi-bookmark-plus'}`} style={{ fontSize: '0.88rem' }}></i>
      </button>
      {/* Category Pill Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          background: player.category === 'MARQUEE' ? 'var(--gold-gradient)' : player.isCapped === false ? 'rgba(255, 171, 0, 0.85)' : 'rgba(0, 0, 0, 0.65)',
          color: player.category === 'MARQUEE' || player.isCapped === false ? '#000' : '#fff',
          fontWeight: '800',
          fontSize: '0.68rem',
          padding: '3px 9px',
          borderRadius: '20px',
          letterSpacing: '0.05em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          border: player.category === 'MARQUEE' ? 'none' : '1px solid rgba(255,255,255,0.15)'
        }}
      >
        {player.auctionSet ? `${player.auctionSet} • ` : ''}
        {player.isCapped === false ? 'UNCAPPED' : player.category}
      </div>

      {/* Status Pill Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2
        }}
      >
        <span className={`badge-status ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Player Image Header */}
      <div
        style={{
          height: '210px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0a1426'
        }}
      >
        <img
          src={player.image || fallbackImage}
          alt={player.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            if (!e.target.dataset.failed) {
              e.target.dataset.failed = 'true';
              e.target.src = fallbackImage;
              e.target.style.objectFit = 'contain';
              e.target.style.padding = '24px';
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        />
        {/* Dark gradient fade into card body */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(15, 26, 48, 1) 100%)'
          }}
        ></div>
      </div>

      {/* Card Content */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Name & Country */}
        <div className="mb-2">
          <div className="d-flex align-items-center justify-content-between">
            <span className={`badge-role ${getRoleBadgeClass(player.role)}`}>
              {getRoleName(player.role)}
            </span>
            <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              {player.country} {player.isOverseas && '✈️'}
            </span>
          </div>
          <h5
            className="text-white mt-2 mb-0 font-display fw-bold text-truncate"
            title={player.name}
            style={{ fontSize: '1.15rem' }}
          >
            {player.name}
          </h5>
        </div>

        {/* Mini Stats Grid */}
        <div
          className="glass-panel p-2 mb-3 d-flex justify-content-around text-center"
          style={{ borderRadius: '8px' }}
        >
          <div>
            <div className="text-secondary" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Matches</div>
            <div className="text-white fw-bold" style={{ fontSize: '0.88rem' }}>{player.stats?.matches || 0}</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Runs / Wkts</div>
            <div className="text-white fw-bold" style={{ fontSize: '0.88rem' }}>
              {player.stats?.runs || 0} / {player.stats?.wickets || 0}
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>SR / Econ</div>
            <div className="text-white fw-bold" style={{ fontSize: '0.88rem' }}>
              {player.stats?.strikeRate || '-'}
            </div>
          </div>
        </div>

        {/* Pricing & Footer */}
        <div className="mt-auto pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {player.status === 'SOLD' ? 'Sold Price' : 'Base Price'}
            </div>
            <div
              className={`fw-bold font-display ${player.status === 'SOLD' ? 'text-success' : 'text-info'}`}
              style={{ fontSize: '1.05rem' }}
            >
              {formatPurse(player.status === 'SOLD' ? player.soldPrice : player.basePrice)}
            </div>
          </div>

          <Link
            to={`/players/${player._id}`}
            className="btn btn-sm btn-premium-glass"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Profile <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
