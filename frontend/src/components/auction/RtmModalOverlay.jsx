import React, { useState, useEffect } from 'react';
import { formatPurse } from '../../utils/formatters';

const RtmModalOverlay = ({ rtmPrompt, userTeam, onDecision }) => {
  const [secondsLeft, setSecondsLeft] = useState(8);

  useEffect(() => {
    if (!rtmPrompt) return;
    setSecondsLeft(rtmPrompt.durationSeconds || 8);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rtmPrompt]);

  if (!rtmPrompt) return null;

  const { player, rtmTeam, winningTeam, winningBid } = rtmPrompt;
  const isMyTeam = userTeam && (userTeam._id === rtmTeam._id || userTeam.shortName === rtmTeam.shortName);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div
        className="glass-card text-center p-4 p-md-5"
        style={{
          maxWidth: '580px',
          width: '100%',
          border: '2px solid #ffd700',
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.35)',
          borderRadius: '24px'
        }}
      >
        {/* RTM Badge */}
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(255, 215, 0, 0.2)', border: '1px solid #ffd700' }}>
          <span style={{ fontSize: '1.2rem' }}>🃏</span>
          <span className="text-warning fw-bold font-display" style={{ fontSize: '0.85rem', letterSpacing: '0.08em' }}>
            OFFICIAL IPL RIGHT TO MATCH (RTM)
          </span>
        </div>

        {/* Dramatic Title */}
        <h3 className="text-white font-display fw-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
          {rtmTeam.name} RTM WINDOW
        </h3>
        <p className="text-white-50 mb-4" style={{ fontSize: '0.92rem' }}>
          As {player.name}&apos;s previous franchise, {rtmTeam.name} has the opportunity to match the final bid!
        </p>

        {/* Player & Bid Spotlight */}
        <div
          className="p-3 mb-4 rounded-3 text-start"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary" style={{ fontSize: '0.82rem' }}>CRICKETER:</span>
            <span className="text-white fw-bold font-display">{player.name} ({player.role})</span>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-secondary" style={{ fontSize: '0.82rem' }}>CURRENT WINNING BIDDER:</span>
            <span className="text-info fw-bold">{winningTeam.name}</span>
          </div>
          <div className="d-flex align-items-center justify-content-between border-top border-secondary border-opacity-25 pt-2">
            <span className="text-secondary" style={{ fontSize: '0.82rem' }}>MATCHING PRICE:</span>
            <span className="text-warning fw-bold font-display fs-4">{formatPurse(winningBid)}</span>
          </div>
        </div>

        {/* 8s Countdown Progress Bar */}
        <div className="mb-4">
          <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.78rem' }}>
            <span>DECISION TIME REMAINING</span>
            <span className="text-warning fw-bold">{secondsLeft}s</span>
          </div>
          <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
              style={{
                width: `${(secondsLeft / 8) * 100}%`,
                transition: 'width 1s linear'
              }}
            ></div>
          </div>
        </div>

        {/* Action Controls */}
        {isMyTeam ? (
          <div className="d-flex gap-3">
            <button
              type="button"
              onClick={() => onDecision(true)}
              className="btn btn-warning flex-grow-1 py-3 fw-bold font-display"
              style={{
                borderRadius: '14px',
                fontSize: '1.05rem',
                color: '#000',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
              }}
            >
              🃏 MATCH {formatPurse(winningBid)} (USE RTM)
            </button>
            <button
              type="button"
              onClick={() => onDecision(false)}
              className="btn btn-outline-secondary px-4 py-3 fw-semibold"
              style={{ borderRadius: '14px', fontSize: '0.95rem' }}
            >
              Pass
            </button>
          </div>
        ) : (
          <div className="glass-panel p-3">
            <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
            <span className="text-white-50" style={{ fontSize: '0.88rem' }}>
              Awaiting decision from franchise owner ({rtmTeam.name})...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RtmModalOverlay;
