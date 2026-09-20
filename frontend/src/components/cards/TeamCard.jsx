import React from 'react';
import { Link } from 'react-router-dom';
import { formatPurse } from '../../utils/formatters';
import TeamLogo from '../common/TeamLogo';

const TeamCard = ({ team }) => {
  if (!team) return null;

  const totalPurse = team.initialPurse || 1200000000;
  const remainingPurse = team.remainingPurse !== undefined ? team.remainingPurse : totalPurse;
  const spentPurse = totalPurse - remainingPurse;
  const percentSpent = Math.min(100, Math.round((spentPurse / totalPurse) * 100));

  const playersCount = team.squadCount !== undefined ? team.squadCount : (team.players?.length || 0);
  const overseasCount = team.overseasCount !== undefined ? team.overseasCount : 0;
  const maxSquad = team.maxSquadSize || 25;
  const maxOverseas = team.maxOverseas || 8;

  return (
    <div
      className="glass-card glass-card-interactive h-100 d-flex flex-column overflow-hidden position-relative"
      style={{
        borderTop: `4px solid ${team.primaryColor || '#00f0ff'}`
      }}
    >
      <div className="p-4 d-flex flex-column flex-grow-1">
        {/* Header: Logo & Name */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${team.primaryColor || '#00f0ff'}20 0%, ${team.secondaryColor || '#0a1324'}80 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 15px ${team.primaryColor ? team.primaryColor + '40' : 'rgba(0,240,255,0.3)'}`,
              padding: '6px'
            }}
          >
            <TeamLogo team={team} size={38} />
          </div>

          <div className="flex-grow-1 overflow-hidden">
            <span
              className="badge"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                fontSize: '0.68rem',
                letterSpacing: '0.05em'
              }}
            >
              {team.shortName}
            </span>
            <h5
              className="text-white mb-0 font-display fw-bold text-truncate mt-1"
              title={team.name}
            >
              {team.name}
            </h5>
            <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
              Owner: {team.owner?.name || 'Franchise Board'}
            </div>
          </div>
        </div>

        {/* Purse Overview Box */}
        <div
          className="glass-panel p-3 mb-3"
          style={{
            background: 'rgba(6, 11, 23, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="d-flex justify-content-between align-items-baseline mb-1">
            <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Remaining Purse
            </span>
            <span className="text-white fw-bold font-display" style={{ fontSize: '1.15rem' }}>
              {formatPurse(remainingPurse)}
            </span>
          </div>

          {/* Progress bar of purse used */}
          <div
            className="progress mt-2"
            style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${percentSpent}%`,
                background: `linear-gradient(90deg, #00f0ff, ${team.primaryColor || '#ffb300'})`,
                borderRadius: '10px'
              }}
              aria-valuenow={percentSpent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: '0.7rem' }}>
            <span>Spent: {formatPurse(spentPurse)}</span>
            <span>{percentSpent}% Used</span>
          </div>
        </div>

        {/* Squad Composition Pills */}
        <div className="row g-2 mb-3 text-center">
          <div className="col-6">
            <div className="glass-panel p-2">
              <div className="text-secondary" style={{ fontSize: '0.7rem' }}>Total Squad</div>
              <div className="text-white fw-bold font-display" style={{ fontSize: '1rem' }}>
                {playersCount} / {maxSquad}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="glass-panel p-2">
              <div className="text-secondary" style={{ fontSize: '0.7rem' }}>Overseas</div>
              <div className="text-white fw-bold font-display" style={{ fontSize: '1rem' }}>
                {overseasCount} / {maxOverseas}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <Link
            to={`/teams/${team._id}`}
            className="btn btn-premium-glass w-100 justify-content-center"
            style={{ fontSize: '0.88rem' }}
          >
            <i className="bi bi-shield-check me-2 text-info"></i> View Team & Squad
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
