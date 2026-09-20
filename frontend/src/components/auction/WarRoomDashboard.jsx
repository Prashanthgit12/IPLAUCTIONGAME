import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';
import { formatPurse } from '../../utils/formatters';
import TeamLogo from '../common/TeamLogo';
import { calculateSquadChemistry } from '../teams/SquadChemistryMeter';

const WarRoomDashboard = ({ onClose }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, MAX_PURSE, MAX_SQUAD

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeams();
        setTeams(data || []);
      } catch (err) {
        console.error('Failed to load War Room teams:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Compute max single bid capacity (must retain min 20L for each unfilled slot to reach minSquadSize of 18)
  const calculateMaxBid = (team) => {
    const remainingSlotsToMin = Math.max(0, 18 - team.squadCount - 1);
    const reserveNeeded = remainingSlotsToMin * 2000000; // 20 Lakhs per min player
    return Math.max(0, team.remainingPurse - reserveNeeded);
  };

  const sortedTeams = [...teams].sort((a, b) => {
    if (filter === 'MAX_PURSE') return b.remainingPurse - a.remainingPurse;
    if (filter === 'MAX_SQUAD') return b.squadCount - a.squadCount;
    return a.name.localeCompare(b.name);
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div
        className="glass-card d-flex flex-column"
        style={{
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '88vh',
          borderRadius: '24px',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div className="p-4 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.6rem' }}>📊</span>
            <div>
              <h4 className="text-white font-display fw-bold mb-0">FRANCHISE WAR ROOM & STRATEGY RADAR</h4>
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                Real-Time Purse Analytics, Maximum Single Bid Capacity & Squad Quotas
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Filter Pills */}
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`btn ${filter === 'ALL' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('MAX_PURSE')}
                className={`btn ${filter === 'MAX_PURSE' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
              >
                Highest Purse
              </button>
              <button
                type="button"
                onClick={() => setFilter('MAX_SQUAD')}
                className={`btn ${filter === 'MAX_SQUAD' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
              >
                Largest Squad
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm btn-outline-secondary rounded-circle ms-2"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Matrix Body */}
        <div className="p-4 overflow-y-auto flex-grow-1">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                <thead>
                  <tr className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th>Franchise</th>
                    <th>Remaining Purse</th>
                    <th>Max Single Bid Power</th>
                    <th>Squad Fill</th>
                    <th>Chemistry</th>
                    <th>Overseas Quota</th>
                    <th>RTM Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((t) => {
                    const pursePct = Math.round((t.remainingPurse / t.initialPurse) * 100);
                    const maxBid = calculateMaxBid(t);
                    const chemistry = calculateSquadChemistry(t.players || []);

                    return (
                      <tr key={t._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <TeamLogo team={t} size={28} />
                            <div>
                              <div className="text-white fw-bold font-display">{t.name}</div>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>{t.shortName}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: '170px' }}>
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
                            <span className="text-success fw-bold font-display">{formatPurse(t.remainingPurse)}</span>
                            <span className="text-muted">{pursePct}%</span>
                          </div>
                          <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${pursePct}%`,
                                backgroundColor: pursePct > 50 ? '#00e676' : pursePct > 25 ? '#ffab00' : '#ff1744'
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span className="text-info fw-bold font-display" style={{ fontSize: '0.95rem' }}>
                            {formatPurse(maxBid)}
                          </span>
                        </td>
                        <td>
                          <span className="text-white fw-semibold" style={{ fontSize: '0.88rem' }}>
                            {t.squadCount} / {t.maxSquadSize}
                          </span>
                          <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                            {t.remainingSlots} slots open
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge font-display fw-bold"
                            style={{
                              backgroundColor: chemistry.overallChemistry >= 80 ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.08)',
                              color: chemistry.overallChemistry >= 80 ? '#00f0ff' : chemistry.overallChemistry >= 60 ? '#ffd700' : '#aaa',
                              border: '1px solid currentColor',
                              fontSize: '0.82rem'
                            }}
                          >
                            ⚡ {chemistry.overallChemistry}/100
                          </span>
                        </td>
                        <td>
                          <span className={`fw-semibold ${t.overseasCount >= t.maxOverseas ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '0.88rem' }}>
                            {t.overseasCount} / {t.maxOverseas} ✈️
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark fw-bold font-display" style={{ fontSize: '0.78rem' }}>
                            🃏 {Math.max(0, (t.rtmCards ?? 2) - (t.rtmUsed ?? 0))} Left
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-dark bg-opacity-50 border-top border-secondary border-opacity-25 text-center text-white-50" style={{ fontSize: '0.8rem' }}>
          💡 Max Single Bid Power reserves minimum base price (₹20 Lakhs) for each remaining slot needed to satisfy the IPL 18-player minimum squad requirement.
        </div>
      </div>
    </div>
  );
};

export default WarRoomDashboard;
