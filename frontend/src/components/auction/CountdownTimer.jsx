import React from 'react';

const CountdownTimer = ({ seconds = 15, isRunning = false }) => {
  const isUrgent = seconds <= 5 && seconds > 0 && isRunning;
  const isExpired = seconds <= 0;

  // Format seconds as 00:XX
  const formattedTime = `00:${seconds < 10 ? '0' : ''}${Math.max(0, seconds)}`;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div
        className={`d-flex align-items-center justify-content-center ${
          isUrgent ? 'timer-urgent' : ''
        }`}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.2rem',
          fontWeight: '900',
          letterSpacing: '0.04em',
          color: isExpired
            ? '#ff1744'
            : isUrgent
            ? '#ff5252'
            : seconds <= 8
            ? '#ffd54f'
            : '#00f0ff',
          textShadow: isUrgent
            ? '0 0 25px rgba(255, 23, 68, 0.8)'
            : '0 0 20px rgba(0, 240, 255, 0.4)',
          lineHeight: 1
        }}
      >
        {formattedTime}
      </div>

      <div className="d-flex align-items-center gap-2 mt-2">
        {isRunning ? (
          <>
            <span
              className="pulse-live-badge"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isUrgent ? '#ff1744' : '#00e676',
                display: 'inline-block'
              }}
            ></span>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                fontWeight: '700',
                color: isUrgent ? '#ff5252' : '#00e676',
                textTransform: 'uppercase'
              }}
            >
              {isUrgent ? 'FINAL CALL!' : 'BIDDING ACTIVE'}
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase'
            }}
          >
            {isExpired ? 'COUNTDOWN ENDED' : 'TIMER PAUSED'}
          </span>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
