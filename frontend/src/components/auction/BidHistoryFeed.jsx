import React from 'react';
import { formatPurse, formatDate } from '../../utils/formatters';
import TeamLogo from '../common/TeamLogo';

const BidHistoryFeed = ({ bids = [] }) => {
  return (
    <div className="glass-card h-100 d-flex flex-column">
      {/* Header */}
      <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-info"></i>
          <h6 className="text-white font-display fw-bold mb-0">BID HISTORY</h6>
        </div>
        <span
          className="badge"
          style={{
            background: 'rgba(0, 240, 255, 0.15)',
            color: '#00f0ff',
            fontSize: '0.72rem'
          }}
        >
          {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {/* Feed List */}
      <div
        className="p-3 flex-grow-1 overflow-auto"
        style={{ maxHeight: '380px' }}
      >
        {bids.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-shield-slash fs-2 mb-2 d-block opacity-50"></i>
            <span style={{ fontSize: '0.88rem' }}>No bids submitted yet for this player</span>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {bids.map((bid, index) => {
              const isLeading = index === 0;

              return (
                <div
                  key={bid._id || index}
                  className={`p-2 p-sm-3 d-flex align-items-center justify-content-between rounded-3 ${
                    index === 0 ? 'bid-item-new' : ''
                  }`}
                  style={{
                    background: isLeading
                      ? 'linear-gradient(90deg, rgba(0, 240, 255, 0.12) 0%, rgba(15, 26, 48, 0.7) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isLeading
                      ? '1px solid rgba(0, 240, 255, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Team Logo & Details */}
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: '3px'
                      }}
                    >
                      <TeamLogo team={bid.team} size={24} />
                    </div>

                    <div className="overflow-hidden">
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-white fw-bold text-truncate" style={{ fontSize: '0.88rem' }}>
                          {bid.team?.name || 'Franchise'}
                        </span>
                        {isLeading && (
                          <span
                            className="badge"
                            style={{
                              background: 'var(--gold-gradient)',
                              color: '#000',
                              fontSize: '0.62rem',
                              fontWeight: '800',
                              padding: '2px 5px'
                            }}
                          >
                            LEAD
                          </span>
                        )}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {formatDate(bid.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-end flex-shrink-0 ms-2">
                    <div
                      className={`font-display fw-bold ${
                        isLeading ? 'text-info' : 'text-white-50'
                      }`}
                      style={{ fontSize: isLeading ? '1.05rem' : '0.92rem' }}
                    >
                      {formatPurse(bid.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidHistoryFeed;
