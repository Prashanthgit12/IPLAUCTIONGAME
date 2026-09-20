import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { tradeService } from '../services/tradeService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCrore } from '../utils/formatters';
import { io } from 'socket.io-client';

const Trades = () => {
  const { user, isTeamOwner } = useAuth();
  const { addToast } = useToast();

  const [trades, setTrades] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'ACCEPTED', 'REJECTED'

  // Propose Modal State
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposerTeamId, setProposerTeamId] = useState('');
  const [targetTeamId, setTargetTeamId] = useState('');
  const [proposerPlayerId, setProposerPlayerId] = useState('');
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [cashAdjustment, setCashAdjustment] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadData = async () => {
    try {
      const [tradesData, teamsData] = await Promise.all([
        tradeService.getTrades(),
        teamService.getTeams()
      ]);
      setTrades(tradesData);
      setTeams(teamsData || []);

      // Default proposer team if user owns one or pick first
      if (teamsData && teamsData.length > 0 && !proposerTeamId) {
        const userTeam = user?.team?._id || user?.team;
        setProposerTeamId(userTeam || teamsData[0]._id);
      }
    } catch (err) {
      console.error('Failed to load trade center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Socket.io for live trade feed
    const socket = io('http://localhost:5000');
    socket.on('trade:update', () => {
      loadData();
    });

    return () => socket.disconnect();
  }, []);

  const proposerTeam = teams.find((t) => t._id === proposerTeamId);
  const targetTeam = teams.find((t) => t._id === targetTeamId);

  const proposerPlayer = proposerTeam?.players?.find(
    (p) => (p.player?._id || p.player).toString() === proposerPlayerId
  )?.player;

  const targetPlayer = targetTeam?.players?.find(
    (p) => (p.player?._id || p.player).toString() === targetPlayerId
  )?.player;

  const handleProposeTrade = async (e) => {
    e.preventDefault();
    if (!proposerTeamId || !targetTeamId || !proposerPlayerId || !targetPlayerId) {
      addToast('Please select both franchises and both players to swap', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await tradeService.proposeTrade({
        proposerTeamId,
        targetTeamId,
        proposerPlayerId,
        targetPlayerId,
        cashAdjustment: Number(cashAdjustment),
        notes
      });

      addToast('Trade proposal dispatched to the franchise desk!', 'success');
      setShowProposeModal(false);
      setTargetPlayerId('');
      setProposerPlayerId('');
      setCashAdjustment(0);
      setNotes('');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit trade proposal', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondTrade = async (tradeId, action) => {
    setActionInProgress(tradeId);
    try {
      const res = await tradeService.respondTrade(tradeId, action);
      addToast(res.message || `Trade ${action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED'}!`, 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update trade proposal', 'danger');
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredTrades = trades.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '70px' }}>
      <div className="container-xl">
        {/* TRADE CENTER HEADER */}
        <div className="glass-card p-4 p-md-5 mb-4 position-relative overflow-hidden">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
            <div>
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill glass-panel mb-2.5">
                <i className="bi bi-arrow-left-right text-info"></i>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.08em', color: '#00f0ff' }}>
                  OFFICIAL IPL TRANSFER WINDOW
                </span>
              </div>
              <h1 className="text-white font-display fw-bold mb-2 display-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                FRANCHISE <span style={{ color: 'var(--gold, #fdb913)' }}>TRADE DESK</span>
              </h1>
              <p className="text-secondary mb-0" style={{ maxWidth: '620px', fontSize: '1rem', lineHeight: '1.5' }}>
                Negotiate bilateral player swaps, adjust franchise purses with cash settlements, and execute official squad transfers.
              </p>
            </div>

            {/* Propose Trade Action Button */}
            <div>
              <button
                onClick={() => setShowProposeModal(true)}
                className="btn btn-premium-gold px-4 py-3 font-display fw-bold d-flex align-items-center gap-2"
                style={{ fontSize: '1.05rem' }}
              >
                <i className="bi bi-plus-circle-fill"></i>
                PROPOSE NEW TRADE
              </button>
            </div>
          </div>
        </div>

        {/* STATS & FILTER BAR */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          {/* Filter Pills */}
          <div className="d-flex gap-2">
            {[
              { id: 'ALL', label: 'All Trades' },
              { id: 'PENDING', label: 'Pending Proposals' },
              { id: 'ACCEPTED', label: 'Executed' },
              { id: 'REJECTED', label: 'Declined' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`btn btn-sm px-3 py-2 font-display ${
                  filter === tab.id
                    ? 'btn-info fw-bold text-dark'
                    : 'btn-outline-secondary text-white-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-secondary small">
            Showing <strong className="text-white">{filteredTrades.length}</strong> trades
          </span>
        </div>

        {/* TRADES LEDGER LIST */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-info mb-2"></span>
            <p className="text-secondary small">Loading Franchise Trade Ledger...</p>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="glass-card text-center p-5 rounded-4">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤝</div>
            <h4 className="text-white font-display fw-bold mb-2">No Trades Found</h4>
            <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: '400px' }}>
              There are currently no trades in this category. Propose a swap between franchises to activate the transfer market!
            </p>
            <button
              onClick={() => setShowProposeModal(true)}
              className="btn btn-premium-accent px-4 py-2 font-display fw-bold"
            >
              Propose First Trade
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredTrades.map((trade) => {
              const isPending = trade.status === 'PENDING';
              const isAccepted = trade.status === 'ACCEPTED';
              const isRejected = trade.status === 'REJECTED';

              return (
                <div
                  key={trade._id}
                  className="glass-card p-4 rounded-4 position-relative overflow-hidden"
                  style={{
                    borderLeft: `5px solid ${
                      isAccepted ? '#00e676' : isRejected ? '#ff1744' : '#ffea00'
                    }`,
                    background: 'linear-gradient(165deg, rgba(14, 20, 35, 0.85) 0%, rgba(8, 12, 20, 0.95) 100%)'
                  }}
                >
                  {/* Trade Card Header */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2.5 border-bottom border-secondary border-opacity-20">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge font-display px-3 py-1.5 ${
                          isAccepted
                            ? 'bg-success text-dark fw-bold'
                            : isRejected
                            ? 'bg-danger text-white'
                            : 'bg-warning text-dark fw-bold'
                        }`}
                      >
                        {trade.status === 'ACCEPTED' ? 'OFFICIALLY EXECUTED' : trade.status}
                      </span>
                      <span className="text-secondary small">
                        Proposal #{trade._id.slice(-6).toUpperCase()} • {new Date(trade.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Cash Adjustment Tag */}
                    {trade.cashAdjustment !== 0 && (
                      <span className="badge bg-secondary bg-opacity-50 text-white font-display px-2.5 py-1">
                        <i className="bi bi-cash-stack text-warning me-1"></i>
                        Cash Settlement: {trade.cashAdjustment > 0 ? `+${formatCrore(trade.cashAdjustment)} to ${trade.targetTeam?.shortName}` : `${formatCrore(Math.abs(trade.cashAdjustment))} to ${trade.proposerTeam?.shortName}`}
                      </span>
                    )}
                  </div>

                  {/* Visual Swap Matchup */}
                  <div className="row g-3 align-items-center my-2">
                    {/* Team A (Proposer) */}
                    <div className="col-md-5">
                      <div className="p-3 rounded-4 glass-panel d-flex align-items-center gap-3">
                        <img
                          src={trade.proposerPlayer?.image || '/players/virat-kohli.jpg'}
                          alt={trade.proposerPlayer?.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            objectFit: 'cover',
                            border: `2px solid ${trade.proposerTeam?.primaryColor || '#00f0ff'}`
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-0.5">
                            <span className="badge bg-dark text-info font-display px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              {trade.proposerTeam?.shortName}
                            </span>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                              {trade.proposerPlayer?.role} {trade.proposerPlayer?.isOverseas ? '✈️' : '🇮🇳'}
                            </span>
                          </div>
                          <h5 className="text-white font-display fw-bold mb-0" style={{ fontSize: '1.15rem' }}>
                            {trade.proposerPlayer?.name}
                          </h5>
                          <span className="text-success small fw-semibold">
                            Valuation: {formatCrore(trade.proposerPlayer?.soldPrice || trade.proposerPlayer?.basePrice || 20000000)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Swap Icon */}
                    <div className="col-md-2 text-center py-2">
                      <div
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00f0ff',
                          fontSize: '1.25rem'
                        }}
                      >
                        <i className="bi bi-arrow-left-right"></i>
                      </div>
                    </div>

                    {/* Team B (Target) */}
                    <div className="col-md-5">
                      <div className="p-3 rounded-4 glass-panel d-flex align-items-center gap-3">
                        <img
                          src={trade.targetPlayer?.image || '/players/virat-kohli.jpg'}
                          alt={trade.targetPlayer?.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            objectFit: 'cover',
                            border: `2px solid ${trade.targetTeam?.primaryColor || '#fdb913'}`
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-0.5">
                            <span className="badge bg-dark text-warning font-display px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              {trade.targetTeam?.shortName}
                            </span>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                              {trade.targetPlayer?.role} {trade.targetPlayer?.isOverseas ? '✈️' : '🇮🇳'}
                            </span>
                          </div>
                          <h5 className="text-white font-display fw-bold mb-0" style={{ fontSize: '1.15rem' }}>
                            {trade.targetPlayer?.name}
                          </h5>
                          <span className="text-success small fw-semibold">
                            Valuation: {formatCrore(trade.targetPlayer?.soldPrice || trade.targetPlayer?.basePrice || 20000000)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Memo */}
                  {trade.notes && (
                    <div className="mt-2 text-secondary small fst-italic px-1">
                      <i className="bi bi-chat-left-quote me-1.5 text-warning"></i>
                      "{trade.notes}"
                    </div>
                  )}

                  {/* Action Controls for Pending Proposals */}
                  {isPending && (
                    <div className="mt-3 pt-3 border-top border-secondary border-opacity-20 d-flex flex-wrap align-items-center justify-content-between gap-3">
                      <span className="text-secondary small">
                        Action required by <strong className="text-white">{trade.targetTeam?.name}</strong>:
                      </span>

                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleRespondTrade(trade._id, 'REJECT')}
                          className="btn btn-sm btn-outline-danger px-3 font-display fw-bold"
                          disabled={actionInProgress === trade._id}
                        >
                          <i className="bi bi-x-circle me-1"></i> DECLINE
                        </button>
                        <button
                          onClick={() => handleRespondTrade(trade._id, 'ACCEPT')}
                          className="btn btn-sm btn-success px-4 font-display fw-bold"
                          disabled={actionInProgress === trade._id}
                        >
                          {actionInProgress === trade._id ? (
                            <span className="spinner-border spinner-border-sm me-1"></span>
                          ) : (
                            <i className="bi bi-check-circle-fill me-1"></i>
                          )}
                          ACCEPT & EXECUTE SWAP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROPOSE TRADE MODAL */}
      {showProposeModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content glass-card border border-warning" style={{ background: '#0b1329' }}>
              <div className="modal-header border-bottom border-secondary border-opacity-25 py-3">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(253, 185, 19, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fdb913'
                    }}
                  >
                    <i className="bi bi-arrow-left-right"></i>
                  </div>
                  <div>
                    <h5 className="modal-title text-white font-display fw-bold mb-0">PROPOSE PLAYER TRADE</h5>
                    <span className="text-secondary small">Negotiate swap agreement between two franchises</span>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProposeModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={handleProposeTrade}>
                  <div className="row g-3">
                    {/* PROPOSING TEAM */}
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 glass-panel h-100" style={{ border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                        <label className="form-label text-info small fw-bold mb-2">OFFERING FRANCHISE</label>
                        <select
                          className="form-select form-select-dark mb-3"
                          value={proposerTeamId}
                          onChange={(e) => {
                            setProposerTeamId(e.target.value);
                            setProposerPlayerId('');
                          }}
                          required
                        >
                          <option value="">-- Pick Offering Team --</option>
                          {teams.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.shortName} - {t.name} ({formatCrore(t.remainingPurse)})
                            </option>
                          ))}
                        </select>

                        <label className="form-label text-secondary small fw-bold mb-1">SELECT SQUAD CRICKETER TO OFFER</label>
                        <select
                          className="form-select form-select-dark"
                          value={proposerPlayerId}
                          onChange={(e) => setProposerPlayerId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose player from squad --</option>
                          {(proposerTeam?.players || []).map((p) => {
                            const pl = p.player || p;
                            return (
                              <option key={pl._id} value={pl._id}>
                                {pl.name} ({pl.role} • {pl.isOverseas ? 'Overseas' : 'Domestic'})
                              </option>
                            );
                          })}
                        </select>

                        {/* Player Preview */}
                        {proposerPlayer && (
                          <div className="d-flex align-items-center gap-2 mt-3 p-2 rounded glass-card">
                            <img
                              src={proposerPlayer.image}
                              alt=""
                              style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong className="text-white small d-block">{proposerPlayer.name}</strong>
                              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                {proposerPlayer.role} • Price: {formatCrore(proposerPlayer.soldPrice || proposerPlayer.basePrice)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TARGET TEAM */}
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 glass-panel h-100" style={{ border: '1px solid rgba(253, 185, 19, 0.2)' }}>
                        <label className="form-label text-warning small fw-bold mb-2">TARGET FRANCHISE</label>
                        <select
                          className="form-select form-select-dark mb-3"
                          value={targetTeamId}
                          onChange={(e) => {
                            setTargetTeamId(e.target.value);
                            setTargetPlayerId('');
                          }}
                          required
                        >
                          <option value="">-- Pick Target Franchise --</option>
                          {teams
                            .filter((t) => t._id !== proposerTeamId)
                            .map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.shortName} - {t.name} ({formatCrore(t.remainingPurse)})
                              </option>
                            ))}
                        </select>

                        <label className="form-label text-secondary small fw-bold mb-1">SELECT SQUAD CRICKETER TO RECEIVE</label>
                        <select
                          className="form-select form-select-dark"
                          value={targetPlayerId}
                          onChange={(e) => setTargetPlayerId(e.target.value)}
                          disabled={!targetTeamId}
                          required
                        >
                          <option value="">-- Choose player to receive --</option>
                          {(targetTeam?.players || []).map((p) => {
                            const pl = p.player || p;
                            return (
                              <option key={pl._id} value={pl._id}>
                                {pl.name} ({pl.role} • {pl.isOverseas ? 'Overseas' : 'Domestic'})
                              </option>
                            );
                          })}
                        </select>

                        {/* Player Preview */}
                        {targetPlayer && (
                          <div className="d-flex align-items-center gap-2 mt-3 p-2 rounded glass-card">
                            <img
                              src={targetPlayer.image}
                              alt=""
                              style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong className="text-white small d-block">{targetPlayer.name}</strong>
                              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                {targetPlayer.role} • Price: {formatCrore(targetPlayer.soldPrice || targetPlayer.basePrice)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CASH ADJUSTMENT */}
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-bold">
                        CASH SETTLEMENT ADJUSTMENT (₹ RUPEES)
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-dark"
                        placeholder="e.g. 50000000 (You pay) or -20000000 (You get)"
                        value={cashAdjustment}
                        onChange={(e) => setCashAdjustment(e.target.value)}
                      />
                      <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        Positive value: Proposer pays cash; Negative value: Proposer receives cash.
                      </span>
                    </div>

                    {/* NOTES / MEMO */}
                    <div className="col-md-6">
                      <label className="form-label text-secondary small fw-bold">TRADE MEMO / JUSTIFICATION</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        placeholder="e.g. Strengthening death bowling unit"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary text-white px-3"
                        onClick={() => setShowProposeModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-premium-gold px-4 font-display fw-bold"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting Trade...' : 'DISPATCH TRADE PROPOSAL'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades;
