import React, { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import { formatPurse, formatDate, getStatusBadge } from '../utils/formatters';
import TeamLogo from '../components/common/TeamLogo';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

const AuctionHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await auctionService.getResults({ status: statusFilter });
        if (res) setResults(res);
      } catch (err) {
        console.error('Failed to load auction history:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [statusFilter]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <span className="text-info font-display fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              OFFICIAL RECORDS
            </span>
            <h2 className="text-white font-display fw-bold mb-0">AUCTION RESULTS & LOG</h2>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-premium-accent' : 'btn-premium-glass'}`}
            >
              All Records
            </button>
            <button
              onClick={() => setStatusFilter('SOLD')}
              className={`btn btn-sm ${statusFilter === 'SOLD' ? 'btn-premium-accent' : 'btn-premium-glass'}`}
            >
              Sold Only
            </button>
            <button
              onClick={() => setStatusFilter('UNSOLD')}
              className={`btn btn-sm ${statusFilter === 'UNSOLD' ? 'btn-premium-accent' : 'btn-premium-glass'}`}
            >
              Unsold
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="glass-card p-4">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : results.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-clock-history fs-1 d-block mb-2 opacity-50"></i>
              No auction results recorded yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark-custom">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Base Price</th>
                    <th>Final Sold Price</th>
                    <th>Winning Team</th>
                    <th>Bids</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const statusInfo = getStatusBadge(r.status);

                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={r.player?.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'}
                              alt={r.player?.name}
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span className="text-white fw-bold">{r.player?.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-secondary">{r.player?.role}</span>
                        </td>
                        <td>
                          <span className={`badge-status ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="text-muted font-display">
                          {formatPurse(r.player?.basePrice)}
                        </td>
                        <td className={`font-display fw-bold ${r.status === 'SOLD' ? 'text-success' : 'text-muted'}`}>
                          {r.status === 'SOLD' ? formatPurse(r.soldPrice) : '-'}
                        </td>
                        <td>
                          {r.team ? (
                            <div className="d-flex align-items-center gap-2">
                              <TeamLogo team={r.team} size={22} />
                              <span className="text-white fw-semibold">{r.team.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-white-50">
                          {r.numberOfBids || 0}
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {formatDate(r.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionHistory;
