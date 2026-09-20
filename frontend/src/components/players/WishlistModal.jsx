import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { formatCrore, formatPurse } from '../../utils/formatters';

const WishlistModal = ({ isOpen, onClose }) => {
  const { wishlist, wishlistCount, toggleWishlist, updateTargetBudget, clearWishlist } = useWishlist();

  if (!isOpen) return null;

  const totalAllocatedBudget = wishlist.reduce((acc, item) => acc + (item.targetBudget || 0), 0);

  return (
    <div
      className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1060
      }}
      onClick={onClose}
    >
      <div
        className="glass-card p-4 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 215, 0, 0.35)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 215, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 215, 0, 0.15)',
                color: '#ffd700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              🎯
            </span>
            <div>
              <h5 className="text-white font-display fw-bold mb-0">FRANCHISE TARGET BOARD</h5>
              <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Shortlisted cricketers with custom bidding targets ({wishlistCount})
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Budget Allocation Summary */}
        <div className="p-3 my-3 glass-panel d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ borderRadius: '12px' }}>
          <div>
            <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Planned Target Spend
            </span>
            <div className="text-warning font-display fw-bold fs-5">
              {formatPurse(totalAllocatedBudget)}
            </div>
          </div>
          <div className="d-flex gap-2">
            {wishlistCount > 0 && (
              <button
                onClick={clearWishlist}
                className="btn btn-outline-danger btn-sm"
                style={{ fontSize: '0.78rem' }}
              >
                Clear All
              </button>
            )}
            <Link
              to="/players"
              onClick={onClose}
              className="btn btn-premium-accent btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              + Find More Players
            </Link>
          </div>
        </div>

        {/* List of Wishlist Players */}
        <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: '52vh' }}>
          {wishlist.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
              <h6 className="text-white font-display fw-bold">Your Target Board is Empty</h6>
              <p className="small mb-3">
                Bookmark marquee and uncapped cricketers from the Players Marketplace to track them during the live auction.
              </p>
              <Link to="/players" onClick={onClose} className="btn btn-outline-info btn-sm">
                Explore Players Marketplace
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {wishlist.map(({ player, targetBudget }) => {
                const statusBadge =
                  player.status === 'SOLD'
                    ? 'bg-success'
                    : player.status === 'IN_AUCTION'
                    ? 'bg-danger'
                    : player.status === 'UNSOLD'
                    ? 'bg-secondary'
                    : 'bg-info text-dark';

                return (
                  <div
                    key={player._id}
                    className="p-2.5 glass-card d-flex align-items-center justify-content-between gap-3"
                    style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {/* Player Info */}
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={player.image || '/players/default-avatar.svg'}
                        alt={player.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          background: '#111'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <strong className="text-white" style={{ fontSize: '0.95rem' }}>
                            {player.name}
                          </strong>
                          <span className={`badge ${statusBadge}`} style={{ fontSize: '0.65rem' }}>
                            {player.status === 'IN_AUCTION' ? 'LIVE NOW' : player.status}
                          </span>
                        </div>
                        <div className="text-secondary small">
                          {player.role} • {player.country} • Base: {formatPurse(player.basePrice)}
                        </div>
                      </div>
                    </div>

                    {/* Target Budget Editor */}
                    <div className="d-flex align-items-center gap-3">
                      <div className="text-end">
                        <label className="text-secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                          Max Target Budget
                        </label>
                        <select
                          className="form-select form-select-sm form-select-dark py-0"
                          style={{ fontSize: '0.8rem', width: '115px' }}
                          value={targetBudget}
                          onChange={(e) => updateTargetBudget(player._id, Number(e.target.value))}
                        >
                          {[2000000, 5000000, 10000000, 20000000, 50000000, 80000000, 100000000, 120000000, 150000000, 180000000, 200000000, 250000000].map((val) => (
                            <option key={val} value={val}>
                              {formatCrore(val)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => toggleWishlist(player)}
                        className="btn btn-outline-danger btn-sm p-1"
                        style={{ width: '30px', height: '30px', borderRadius: '8px' }}
                        title="Remove from target list"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
            💡 Target players will glow gold with special alerts when brought onto the live auction block.
          </span>
          <button onClick={onClose} className="btn btn-premium-glass btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;
