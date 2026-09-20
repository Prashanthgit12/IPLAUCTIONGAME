import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playerService } from '../services/playerService';
import TeamLogo from '../components/common/TeamLogo';
import { formatPurse, getRoleBadgeClass, getRoleName, getStatusBadge, formatDate } from '../utils/formatters';

const PlayerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await playerService.getPlayerById(id);
        setData(res);
      } catch (err) {
        console.error('Failed to load player details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="container py-5 text-center" style={{ paddingTop: '100px' }}>
        <h3 className="text-white">Player not found</h3>
        <Link to="/players" className="btn btn-premium-accent mt-3">Back to Players</Link>
      </div>
    );
  }

  const { player, bids } = data;
  const statusInfo = getStatusBadge(player.status);
  const fallbackImage = '/logos/ipl.svg';

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link to="/players" className="text-secondary text-decoration-none hover-white" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-arrow-left me-1"></i> Back to Players Pool
          </Link>
        </div>

        {/* Hero Card */}
        <div className="broadcast-card p-4 p-md-5 mb-5">
          <div className="row g-4 align-items-center">
            {/* Player Avatar */}
            <div className="col-lg-4 col-md-5 text-center">
              <div
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '340px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  margin: '0 auto',
                  border: '2px solid rgba(0, 240, 255, 0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  backgroundColor: '#0a1426'
                }}
              >
                <img
                  src={player.image || fallbackImage}
                  alt={player.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                  onError={(e) => {
                    if (!e.target.dataset.failed) {
                      e.target.dataset.failed = 'true';
                      e.target.src = fallbackImage;
                      e.target.style.objectFit = 'contain';
                      e.target.style.padding = '30px';
                    }
                  }}
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="col-lg-8 col-md-7">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className={`badge-role ${getRoleBadgeClass(player.role)}`}>
                  {getRoleName(player.role)}
                </span>
                <span className={`badge-status ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
                <span className="badge bg-secondary text-white" style={{ fontSize: '0.75rem' }}>
                  {player.category} SET
                </span>
              </div>

              <h1 className="text-white font-display fw-bold mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                {player.name}
              </h1>

              <div className="text-secondary mb-4" style={{ fontSize: '1rem' }}>
                {player.country} {player.isOverseas && '✈️ (Overseas)'} • Age: {player.age}
              </div>

              {/* Price & Sold details */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <div className="glass-panel p-3">
                    <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Base Price</span>
                    <div className="text-info font-display fw-bold" style={{ fontSize: '1.4rem' }}>
                      {formatPurse(player.basePrice)}
                    </div>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="glass-panel p-3">
                    <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {player.status === 'SOLD' ? 'Acquired By' : 'Current Auction State'}
                    </span>
                    <div className="text-white font-display fw-bold text-truncate" style={{ fontSize: '1.4rem' }}>
                      {player.status === 'SOLD' && player.soldTo
                        ? `${player.soldTo.name} (${formatPurse(player.soldPrice)})`
                        : statusInfo.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Playing Styles */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Batting Style</div>
                  <div className="text-white fw-semibold">{player.battingStyle || 'Right-hand bat'}</div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Bowling Style</div>
                  <div className="text-white fw-semibold">{player.bowlingStyle || 'None'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats & Bid History */}
        <div className="row g-4">
          {/* Career Stats (col-lg-6) */}
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <h5 className="text-white font-display fw-bold mb-4">CAREER T20 STATISTICS</h5>
              <div className="row g-3 text-center">
                <div className="col-4">
                  <div className="glass-panel p-3">
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>MATCHES</div>
                    <div className="text-white font-display fw-bold fs-4">{player.stats?.matches || 0}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="glass-panel p-3">
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>TOTAL RUNS</div>
                    <div className="text-white font-display fw-bold fs-4">{player.stats?.runs || 0}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="glass-panel p-3">
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>HIGHEST SCORE</div>
                    <div className="text-info font-display fw-bold fs-4">{player.stats?.highestScore || '-'}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="glass-panel p-3">
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>WICKETS</div>
                    <div className="text-white font-display fw-bold fs-4">{player.stats?.wickets || 0}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="glass-panel p-3">
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>BEST BOWLING</div>
                    <div className="text-info font-display fw-bold fs-4">{player.stats?.bestBowling || '-'}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="glass-panel p-3">
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>STRIKE RATE</div>
                    <div className="text-success font-display fw-bold fs-4">{player.stats?.strikeRate || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auction Bid History (col-lg-6) */}
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <h5 className="text-white font-display fw-bold mb-4">AUCTION BIDDING RECORD</h5>
              {!bids || bids.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-receipt fs-1 d-block mb-2 opacity-50"></i>
                  No recorded auction bids for this player yet.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {bids.map((bid, i) => (
                    <div
                      key={bid._id || i}
                      className="p-3 glass-panel d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <TeamLogo team={bid.team} size={24} />
                        <div>
                          <div className="text-white fw-bold">{bid.team?.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{formatDate(bid.timestamp)}</div>
                        </div>
                      </div>
                      <div className="text-info font-display fw-bold fs-5">
                        {formatPurse(bid.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
