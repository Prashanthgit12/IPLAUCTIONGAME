import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatPurse } from '../../utils/formatters';
import TeamLogo from '../common/TeamLogo';

const BidControlPanel = ({
  auction,
  onPlaceBid,
  remainingSeconds = 15,
  isTimerRunning = false
}) => {
  const { user, isTeamOwner } = useAuth();
  const [customBidInput, setCustomBidInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!auction || !auction.currentPlayer) {
    return (
      <div className="glass-card p-4 text-center">
        <p className="text-secondary mb-0">Bidding is closed while waiting for the next player.</p>
      </div>
    );
  }

  const currentBid = auction.currentBid || auction.currentPlayer.basePrice || 0;
  const currentTeam = auction.currentTeam;
  const userTeam = user?.team;

  // Calculate standard increment
  const calculateIncrement = (bid) => {
    if (bid < 10000000) return 1000000; // 10L
    if (bid < 50000000) return 2500000; // 25L
    if (bid < 100000000) return 5000000; // 50L
    return 10000000; // 1 Cr
  };

  const minIncrement = calculateIncrement(currentBid);
  const minNextBid = currentTeam ? currentBid + minIncrement : currentBid;

  const isHighestBidder =
    userTeam && currentTeam && (currentTeam._id === userTeam._id || currentTeam._id === userTeam);

  const remainingPurse = userTeam?.remainingPurse !== undefined ? userTeam.remainingPurse : 1200000000;
  const hasSufficientPurse = remainingPurse >= minNextBid;
  const isAuctionActive = auction && auction.status !== 'ENDED' && auction.currentPlayer && auction.currentPlayer.status !== 'SOLD' && auction.currentPlayer.status !== 'UNSOLD';

  const handlePlaceBid = (targetAmount) => {
    setErrorMsg('');
    const proposedAmount = Number(targetAmount);

    if (isNaN(proposedAmount) || proposedAmount <= 0) {
      setErrorMsg('Invalid bid amount');
      return;
    }

    if (userTeam && userTeam.remainingPurse && userTeam.remainingPurse < proposedAmount) {
      setErrorMsg(`Insufficient purse! You have ${formatPurse(userTeam.remainingPurse)} left.`);
      return;
    }

    const teamIdToUse = userTeam?._id || userTeam;
    onPlaceBid(teamIdToUse, proposedAmount);
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedCr = parseFloat(customBidInput);
    if (isNaN(parsedCr) || parsedCr <= 0) {
      setErrorMsg('Please enter a valid numeric bid amount in Crores');
      return;
    }

    const proposedAmount = Math.round(parsedCr * 10000000);

    if (proposedAmount < minNextBid) {
      setErrorMsg(`Bid must be at least ${formatPurse(minNextBid)}`);
      return;
    }

    if (userTeam && userTeam.remainingPurse < proposedAmount) {
      setErrorMsg(`Insufficient purse! You only have ${formatPurse(userTeam.remainingPurse)}.`);
      return;
    }

    handlePlaceBid(proposedAmount);
    setCustomBidInput('');
  };

  return (
    <div className="glass-card p-3 p-md-4">
      {/* Header / Team Purse Banner */}
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
        <h5 className="text-white font-display fw-bold mb-0">BIDDING CONSOLE</h5>
        {isTeamOwner && userTeam && (
          <div className="text-end">
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Your Team Purse: </span>
            <span className="text-success fw-bold font-display">{formatPurse(userTeam.remainingPurse)}</span>
          </div>
        )}
      </div>

      {/* Error message alert */}
      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Check Roles */}
      {!user ? (
        <div className="glass-panel p-4 text-center" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center justify-content-center gap-2 text-info mb-2">
            <i className="bi bi-shield-lock fs-5"></i>
            <span className="fw-bold font-display" style={{ fontSize: '1rem', letterSpacing: '0.04em' }}>
              SIGN IN OR REGISTER TO BID
            </span>
          </div>
          <p className="text-secondary mb-3" style={{ fontSize: '0.88rem' }}>
            Sign in or register a new franchise account to participate in live bidding sessions.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-sm btn-outline-info px-4 py-2 fw-bold">
              <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
            </Link>
            <Link to="/register" className="btn btn-sm btn-premium-accent px-4 py-2 fw-bold">
              <i className="bi bi-person-plus-fill me-1"></i> Register Account
            </Link>
          </div>
        </div>
      ) : !isTeamOwner && user.role !== 'ADMIN' ? (
        <div className="glass-panel p-4 text-center" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning mb-2">
            <i className="bi bi-eye fs-5"></i>
            <span className="fw-bold font-display" style={{ fontSize: '1rem' }}>
              SPECTATOR MODE
            </span>
          </div>
          <p className="text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
            You are signed in as a Viewer. Only Franchise Team Owners or Administrators can place live bids.
          </p>
          <Link to="/register" className="btn btn-sm btn-outline-warning px-3 py-2 fw-bold">
            <i className="bi bi-person-badge me-1"></i> Register as Franchise Owner
          </Link>
        </div>
      ) : isTeamOwner && !userTeam ? (
        <div className="glass-panel p-4 text-center" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning mb-2">
            <i className="bi bi-exclamation-circle fs-5"></i>
            <span className="fw-bold font-display" style={{ fontSize: '1rem' }}>
              FRANCHISE UNASSIGNED
            </span>
          </div>
          <p className="text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
            Your account does not have an assigned franchise yet. Please link your franchise in your profile to place live bids.
          </p>
          <Link to="/profile" className="btn btn-sm btn-premium-glass px-4 py-2 fw-bold">
            Go to Profile <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      ) : isHighestBidder ? (
        <div
          className="p-3 text-center mb-3"
          style={{
            background: 'rgba(0, 230, 118, 0.12)',
            border: '1px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '12px'
          }}
        >
          <div className="text-success fw-bold font-display" style={{ fontSize: '1.1rem' }}>
            🎉 YOUR FRANCHISE HOLDS THE LEADING BID!
          </div>
          <div className="text-white-50" style={{ fontSize: '0.82rem' }}>
            Current Lead: {formatPurse(currentBid)}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Increment Buttons */}
          <div className="mb-3">
            <label className="text-secondary fw-semibold mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Quick Increments (Touch to Bid)
            </label>
            <div className="row g-2">
              <div className="col-6 col-sm-3">
                <button
                  type="button"
                  onClick={() => handlePlaceBid(currentTeam ? currentBid + 2500000 : minNextBid + 2500000)}
                  disabled={!isAuctionActive || !hasSufficientPurse}
                  className="btn btn-premium-glass w-100 py-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  +₹25 Lakhs
                </button>
              </div>
              <div className="col-6 col-sm-3">
                <button
                  type="button"
                  onClick={() => handlePlaceBid(currentTeam ? currentBid + 5000000 : minNextBid + 5000000)}
                  disabled={!isAuctionActive || !hasSufficientPurse}
                  className="btn btn-premium-glass w-100 py-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  +₹50 Lakhs
                </button>
              </div>
              <div className="col-6 col-sm-3">
                <button
                  type="button"
                  onClick={() => handlePlaceBid(currentTeam ? currentBid + 10000000 : minNextBid + 10000000)}
                  disabled={!isAuctionActive || !hasSufficientPurse}
                  className="btn btn-premium-glass w-100 py-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  +₹1.00 Cr
                </button>
              </div>
              <div className="col-6 col-sm-3">
                <button
                  type="button"
                  onClick={() => handlePlaceBid(currentTeam ? currentBid + 20000000 : minNextBid + 20000000)}
                  disabled={!isAuctionActive || !hasSufficientPurse}
                  className="btn btn-premium-glass w-100 py-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  +₹2.00 Cr
                </button>
              </div>
            </div>
          </div>

          {/* Primary Touch-Friendly Big Bid Button */}
          <button
            type="button"
            id="btn-place-bid"
            onClick={() => handlePlaceBid(minNextBid)}
            disabled={!isAuctionActive || !hasSufficientPurse}
            className="btn btn-premium-accent w-100 py-3 mb-3"
            style={{
              fontSize: '1.25rem',
              letterSpacing: '0.02em',
              borderRadius: '14px',
              boxShadow: isAuctionActive ? '0 8px 30px rgba(0, 240, 255, 0.45)' : 'none'
            }}
          >
            <i className="bi bi-hammer me-2"></i>
            BID {formatPurse(minNextBid)}
          </button>

          {/* Custom Bid Formulation Form */}
          <form onSubmit={handleCustomBidSubmit} className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-white" style={{ fontSize: '0.85rem' }}>
                ₹ Cr
              </span>
              <input
                type="number"
                step="0.05"
                min={(minNextBid / 10000000).toFixed(2)}
                className="form-control form-control-dark"
                placeholder={`Min ${(minNextBid / 10000000).toFixed(2)} Cr`}
                value={customBidInput}
                onChange={(e) => setCustomBidInput(e.target.value)}
                disabled={!isAuctionActive}
                style={{ fontSize: '0.9rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={!isAuctionActive || !customBidInput}
              className="btn btn-premium-gold px-3"
              style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              Custom Bid
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default BidControlPanel;
