import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCrore } from '../../utils/formatters';

const TradeDeskModal = ({ currentTeam, allTeams = [], onClose, onTradeCompleted }) => {
  const { addToast } = useToast();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Trade Form State
  const [mode, setMode] = useState('list'); // 'list' or 'create'
  const [targetTeamId, setTargetTeamId] = useState('');
  const [targetTeam, setTargetTeam] = useState(null);
  const [proposerPlayerId, setProposerPlayerId] = useState('');
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [cashAdjustment, setCashAdjustment] = useState(0); // in Rupees
  const [notes, setNotes] = useState('');

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/trades?teamId=${currentTeam._id}`);
      if (res.data?.data) {
        setTrades(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [currentTeam]);

  // Load target team squad when chosen
  useEffect(() => {
    if (!targetTeamId) {
      setTargetTeam(null);
      return;
    }
    const fetchTargetTeam = async () => {
      try {
        const res = await api.get(`/teams/${targetTeamId}`);
        if (res.data?.data) {
          setTargetTeam(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load target team:', err);
      }
    };
    fetchTargetTeam();
  }, [targetTeamId]);

  const handleProposeTrade = async (e) => {
    e.preventDefault();
    if (!proposerPlayerId || !targetPlayerId || !targetTeamId) {
      addToast('Please select both players and the target franchise', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/trades', {
        proposerTeamId: currentTeam._id,
        targetTeamId,
        proposerPlayerId,
        targetPlayerId,
        cashAdjustment: Number(cashAdjustment),
        notes
      });

      addToast('Trade proposal officially dispatched to franchise desk!', 'success');
      setMode('list');
      setTargetTeamId('');
      setProposerPlayerId('');
      setTargetPlayerId('');
      setCashAdjustment(0);
      setNotes('');
      fetchTrades();
      if (onTradeCompleted) onTradeCompleted();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit trade proposal', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondTrade = async (tradeId, action) => {
    try {
      await api.put(`/trades/${tradeId}/respond`, { action });
      addToast(`Trade proposal has been ${action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'}!`, 'success');
      fetchTrades();
      if (onTradeCompleted) onTradeCompleted();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update trade', 'danger');
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content glass-card border border-secondary border-opacity-25" style={{ background: '#0b1329' }}>
          {/* Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 py-3">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.4rem' }}>🤝</span>
              <div>
                <h5 className="modal-title text-white font-display fw-bold mb-0">FRANCHISE TRADE & TRANSFER DESK</h5>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Bilateral Player Swaps & Cash Settlement Desk • {currentTeam.name}
                </span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Sub Navigation Bar */}
          <div className="px-3 pt-3 pb-2 border-bottom border-secondary border-opacity-25 d-flex gap-2">
            <button
              className={`btn btn-sm ${mode === 'list' ? 'btn-info' : 'btn-outline-secondary text-white'}`}
              onClick={() => setMode('list')}
            >
              Trade Desk History ({trades.length})
            </button>
            <button
              className={`btn btn-sm ${mode === 'create' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
              onClick={() => setMode('create')}
            >
              <i className="bi bi-plus-circle me-1"></i> Propose New Trade
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-3 p-md-4">
            {mode === 'create' ? (
              <form onSubmit={handleProposeTrade}>
                <div className="row g-3">
                  {/* Select Target Franchise */}
                  <div className="col-12">
                    <label className="form-label text-secondary small fw-bold">SELECT TARGET FRANCHISE</label>
                    <select
                      className="form-select form-select-dark"
                      value={targetTeamId}
                      onChange={(e) => setTargetTeamId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Franchise to Trade With --</option>
                      {allTeams
                        .filter((t) => t._id !== currentTeam._id)
                        .map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.shortName} - {t.name} • Purse: {formatCrore(t.remainingPurse)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Player to Offer (From Current Team) */}
                  <div className="col-md-6">
                    <div className="p-3 rounded glass-card h-100">
                      <label className="form-label text-warning small fw-bold mb-2">
                        OFFER PLAYER ({currentTeam.shortName})
                      </label>
                      <select
                        className="form-select form-select-dark"
                        value={proposerPlayerId}
                        onChange={(e) => setProposerPlayerId(e.target.value)}
                        required
                      >
                        <option value="">-- Pick player from your squad --</option>
                        {(currentTeam.players || []).map((p) => {
                          const pl = p.player || p;
                          return (
                            <option key={pl._id} value={pl._id}>
                              {pl.name} ({pl.role} {pl.isOverseas ? '✈️' : '🇮🇳'})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Player to Request (From Target Team) */}
                  <div className="col-md-6">
                    <div className="p-3 rounded glass-card h-100">
                      <label className="form-label text-info small fw-bold mb-2">
                        REQUEST PLAYER ({targetTeam ? targetTeam.shortName : 'Target Team'})
                      </label>
                      <select
                        className="form-select form-select-dark"
                        value={targetPlayerId}
                        onChange={(e) => setTargetPlayerId(e.target.value)}
                        disabled={!targetTeam}
                        required
                      >
                        <option value="">-- Pick player to receive --</option>
                        {targetTeam &&
                          (targetTeam.squad || targetTeam.players || []).map((p) => {
                            const pl = p.player || p;
                            return (
                              <option key={pl._id} value={pl._id}>
                                {pl.name} ({pl.role} {pl.isOverseas ? '✈️' : '🇮🇳'})
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>

                  {/* Cash Adjustment */}
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">
                      CASH ADJUSTMENT (₹ RUPEES)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-dark"
                      placeholder="e.g. 20000000 (You pay) or -10000000 (You receive)"
                      value={cashAdjustment}
                      onChange={(e) => setCashAdjustment(e.target.value)}
                    />
                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      Positive = You pay cash; Negative = You receive cash.
                    </span>
                  </div>

                  {/* Notes / Pitch */}
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">TRADE MEMO / NOTES</label>
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      placeholder="e.g. Strengthening pace attack for middle overs"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Submit Proposal */}
                  <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary text-white px-3"
                      onClick={() => setMode('list')}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 fw-bold font-display" disabled={submitting}>
                      {submitting ? 'Submitting Trade...' : 'DISPATCH TRADE PROPOSAL'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                {loading ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-info"></span>
                    <p className="text-secondary mt-2 small">Loading trade ledger...</p>
                  </div>
                ) : trades.length === 0 ? (
                  <div className="text-center py-5">
                    <span style={{ fontSize: '2.5rem' }}>📄</span>
                    <h6 className="text-white font-display mt-2">No Active Trade Proposals</h6>
                    <p className="text-secondary small">
                      Propose a trade with another franchise using the button above.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {trades.map((t) => {
                      const isIncoming = t.targetTeam?._id === currentTeam._id;
                      return (
                        <div
                          key={t._id}
                          className="glass-card p-3 rounded"
                          style={{
                            borderLeft: `4px solid ${
                              t.status === 'ACCEPTED' ? '#00e676' : t.status === 'REJECTED' ? '#ff1744' : '#ffea00'
                            }`
                          }}
                        >
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom border-secondary border-opacity-15">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-secondary font-display">
                                {isIncoming ? 'INCOMING PROPOSAL' : 'OUTGOING PROPOSAL'}
                              </span>
                              <span className="text-secondary small">
                                {new Date(t.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`badge font-display ${
                                t.status === 'ACCEPTED'
                                  ? 'bg-success'
                                  : t.status === 'REJECTED'
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>

                          {/* Trade Matchup */}
                          <div className="row g-2 align-items-center my-1">
                            <div className="col-5">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={t.proposerPlayer?.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100'}
                                  alt=""
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                  <strong className="text-white d-block small">{t.proposerPlayer?.name}</strong>
                                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                    {t.proposerTeam?.shortName} • {t.proposerPlayer?.role}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="col-2 text-center">
                              <i className="bi bi-arrow-left-right text-info fs-5"></i>
                            </div>
                            <div className="col-5">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={t.targetPlayer?.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100'}
                                  alt=""
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                  <strong className="text-white d-block small">{t.targetPlayer?.name}</strong>
                                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                    {t.targetTeam?.shortName} • {t.targetPlayer?.role}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {t.notes && (
                            <div className="text-secondary small mt-2 fst-italic">
                              Memo: "{t.notes}"
                            </div>
                          )}

                          {/* Action Buttons for Pending Incoming Proposals */}
                          {isIncoming && t.status === 'PENDING' && (
                            <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                              <button
                                className="btn btn-sm btn-outline-danger px-3"
                                onClick={() => handleRespondTrade(t._id, 'REJECT')}
                              >
                                Decline
                              </button>
                              <button
                                className="btn btn-sm btn-success px-4 fw-bold"
                                onClick={() => handleRespondTrade(t._id, 'ACCEPT')}
                              >
                                Accept & Swap Players
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDeskModal;
