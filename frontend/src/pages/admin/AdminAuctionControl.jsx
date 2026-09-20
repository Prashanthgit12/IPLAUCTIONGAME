import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionSocketContext';
import { auctionService } from '../../services/auctionService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import CountdownTimer from '../../components/auction/CountdownTimer';
import { formatPurse, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const AdminAuctionControl = () => {
  const { auction, bids, remainingSeconds, isTimerRunning } = useAuction();
  const [loadingAction, setLoadingAction] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState({
    timerSeconds: 15,
    resetTimerSeconds: 10,
    snipeThresholdSeconds: 5,
    maxSquadSize: 25,
    maxOverseas: 8
  });
  const { addToast } = useToast();

  const auctionId = auction?._id;

  const handleStart = async () => {
    if (!auctionId) return;
    setLoadingAction(true);
    try {
      await auctionService.startAuction(auctionId);
      addToast('Auction started successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePause = async () => {
    if (!auctionId) return;
    setLoadingAction(true);
    try {
      await auctionService.pauseAuction(auctionId);
      addToast('Auction paused', 'warning');
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResume = async () => {
    if (!auctionId) return;
    setLoadingAction(true);
    try {
      await auctionService.resumeAuction(auctionId);
      addToast('Auction resumed', 'success');
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEnd = async () => {
    if (!auctionId || !window.confirm('Are you sure you want to end this auction session?')) return;
    setLoadingAction(true);
    try {
      await auctionService.endAuction(auctionId);
      addToast('Auction ended', 'info');
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMarkSold = async () => {
    if (!auctionId) return;
    setLoadingAction(true);
    try {
      await auctionService.markSold(auctionId);
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMarkUnsold = async () => {
    if (!auctionId) return;
    setLoadingAction(true);
    try {
      await auctionService.markUnsold(auctionId);
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleNextPlayer = async () => {
    if (!auctionId) return;
    setLoadingAction(true);
    try {
      await auctionService.nextPlayer(auctionId);
      addToast('Brought next available cricketer to the auction block', 'info');
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetToStart = async () => {
    if (!window.confirm('Reset auction to starting cricketer (Virat Kohli) with 0 bids and timer paused?')) return;
    setLoadingAction(true);
    try {
      await auctionService.resetAuctionToStart();
      addToast('Auction reset to starting cricketer (Virat Kohli) with 0 bids!', 'success');
    } catch (err) {
      addToast(err.message, 'danger');
    } finally {
      setLoadingAction(false);
    }
  };

  const currentPlayer = auction?.currentPlayer;
  const currentBid = auction?.currentBid || currentPlayer?.basePrice || 0;
  const currentTeam = auction?.currentTeam;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <AdminSidebar />
          </div>

          {/* Main Console */}
          <div className="col-lg-9">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <span className="text-danger font-display fw-bold" style={{ fontSize: '0.85rem' }}>
                  AUCTIONEER CONSOLE
                </span>
                <h2 className="text-white font-display fw-bold mb-0">LIVE AUCTION CONTROL</h2>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="badge-live pulse-live-badge">
                  {auction?.status || 'IDLE'}
                </span>
              </div>
            </div>

            {/* Auctioneer Main Control Deck */}
            <div className="broadcast-card p-4 mb-4">
              <div className="row g-4 align-items-center">
                {/* Current Candidate on Block */}
                <div className="col-md-5 border-end border-secondary border-opacity-25">
                  <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Current Cricketer On Block
                  </span>
                  {currentPlayer ? (
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <img
                        src={currentPlayer.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'}
                        alt={currentPlayer.name}
                        style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 className="text-white font-display fw-bold mb-1">{currentPlayer.name}</h4>
                        <span className="badge badge-batter me-2">{currentPlayer.role}</span>
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{currentPlayer.country}</span>
                        <div className="text-info font-display fw-bold mt-1">
                          Base: {formatPurse(currentPlayer.basePrice)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 text-muted">
                      No player currently on block. Click "Next Player" to begin.
                    </div>
                  )}
                </div>

                {/* Leading Bid Status */}
                <div className="col-md-4 text-center border-end border-secondary border-opacity-25">
                  <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Highest Live Bid
                  </span>
                  <div className="text-success font-display fw-bold fs-2 mt-1">
                    {formatPurse(currentBid)}
                  </div>
                  <div className="text-white mt-1">
                    {currentTeam ? (
                      <span className="badge bg-dark border border-secondary px-3 py-1">
                        {currentTeam.name}
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Awaiting initial bid</span>
                    )}
                  </div>
                </div>

                {/* Timer Control Box */}
                <div className="col-md-3 text-center">
                  <CountdownTimer
                    seconds={remainingSeconds}
                    isRunning={isTimerRunning}
                  />
                </div>
              </div>

              {/* Master Control Buttons */}
              <div className="pt-4 mt-4 border-top border-secondary border-opacity-25 d-flex flex-wrap gap-2 justify-content-center">
                {auction?.status === 'LIVE' ? (
                  <button
                    onClick={handlePause}
                    disabled={loadingAction}
                    className="btn btn-warning fw-bold px-4"
                  >
                    <i className="bi bi-pause-fill me-1"></i> PAUSE AUCTION
                  </button>
                ) : (
                  <button
                    onClick={auction?.status === 'PAUSED' ? handleResume : handleStart}
                    disabled={loadingAction}
                    className="btn btn-success fw-bold px-4"
                  >
                    <i className="bi bi-play-fill me-1"></i>{' '}
                    {auction?.status === 'PAUSED' ? 'RESUME AUCTION' : 'START AUCTION'}
                  </button>
                )}

                {/* Sold / Unsold Actions */}
                <button
                  onClick={handleMarkSold}
                  disabled={loadingAction || !currentTeam || !currentPlayer}
                  className="btn btn-premium-gold px-4"
                >
                  <i className="bi bi-hammer me-1"></i> MARK SOLD
                </button>

                <button
                  onClick={handleMarkUnsold}
                  disabled={loadingAction || !currentPlayer}
                  className="btn btn-danger-glow px-4"
                >
                  <i className="bi bi-x-circle me-1"></i> MARK UNSOLD
                </button>

                {/* Next Player */}
                <button
                  onClick={handleNextPlayer}
                  disabled={loadingAction}
                  className="btn btn-premium-accent px-4"
                >
                  <i className="bi bi-skip-forward-fill me-1"></i> NEXT PLAYER
                </button>

                {/* Reset to Start */}
                <button
                  onClick={handleResetToStart}
                  disabled={loadingAction}
                  className="btn btn-outline-info fw-bold px-3"
                  title="Reset auction to starting cricketer (Virat Kohli) with 0 bids"
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> RESET TO START
                </button>

                <button
                  onClick={handleEnd}
                  disabled={loadingAction || auction?.status === 'ENDED'}
                  className="btn btn-outline-danger px-3 ms-auto"
                >
                  END AUCTION
                </button>
              </div>
            </div>

            {/* Live Bids Feed in Admin Console */}
            <div className="glass-card p-4">
              <h5 className="text-white font-display fw-bold mb-3">CURRENT PLAYER BID LOG</h5>
              {bids.length === 0 ? (
                <div className="text-center py-4 text-muted">No bids recorded for current player.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark-custom">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Franchise</th>
                        <th>Bidder</th>
                        <th>Amount</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.map((b, i) => (
                        <tr key={b._id || i}>
                          <td>#{bids.length - i}</td>
                          <td>
                            <span className="text-info fw-bold">{b.team?.name}</span>
                          </td>
                          <td className="text-white-50">{b.bidder?.name || 'Owner'}</td>
                          <td className="text-success font-display fw-bold fs-5">{formatPurse(b.amount)}</td>
                          <td className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(b.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuctionControl;
