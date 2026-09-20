import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getRoleBadgeClass, getRoleName } from '../../utils/formatters';
import TeamLogo from '../common/TeamLogo';

const DEFAULT_POSITIONS = [
  { id: 1, name: 'Wicket Keeper', x: 50, y: 88, roleReq: 'WICKET_KEEPER' },
  { id: 2, name: 'First Slip', x: 62, y: 82, roleReq: 'BATTER' },
  { id: 3, name: 'Point', x: 22, y: 65, roleReq: 'ANY' },
  { id: 4, name: 'Cover', x: 26, y: 45, roleReq: 'BATTER' },
  { id: 5, name: 'Extra Cover', x: 30, y: 28, roleReq: 'BATTER' },
  { id: 6, name: 'Mid Off', x: 42, y: 35, roleReq: 'ALL_ROUNDER' },
  { id: 7, name: 'Mid On', x: 58, y: 35, roleReq: 'ALL_ROUNDER' },
  { id: 8, name: 'Midwicket', x: 74, y: 48, roleReq: 'ANY' },
  { id: 9, name: 'Square Leg', x: 78, y: 68, roleReq: 'ANY' },
  { id: 10, name: 'Death Pacer', x: 50, y: 15, roleReq: 'BOWLER' },
  { id: 11, name: 'Strike Bowler', x: 50, y: 42, roleReq: 'BOWLER' }
];

const TacticalPitchBoard = ({ team, isOwner, onTeamUpdated }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [playingXI, setPlayingXI] = useState([]);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const squad = team?.players?.map((p) => p.player).filter(Boolean) || [];

  useEffect(() => {
    if (team?.playingXI && team.playingXI.length > 0) {
      setPlayingXI(team.playingXI);
    } else if (squad.length > 0) {
      handleAutoPick();
    }
  }, [team]);

  // Count overseas in Playing XI
  const overseasCount = playingXI.filter((item) => {
    const p = squad.find((sq) => sq._id === (item.player?._id || item.player));
    return p?.isOverseas;
  }).length;

  const keepersCount = playingXI.filter((item) => {
    const p = squad.find((sq) => sq._id === (item.player?._id || item.player));
    return p?.role === 'WICKET_KEEPER';
  }).length;

  // Calculate Team Strength Metrics
  const battingDepthScore = Math.min(100, Math.round((playingXI.length / 11) * 60 + keepersCount * 15 + Math.random() * 5));
  const bowlingAttackScore = Math.min(100, Math.round((playingXI.filter((item) => {
    const p = squad.find((sq) => sq._id === (item.player?._id || item.player));
    return p?.role === 'BOWLER' || p?.role === 'ALL_ROUNDER';
  }).length / 5) * 85));
  const teamBalance = Math.round((battingDepthScore + bowlingAttackScore) / 2);

  // Assign player to selected position
  const assignPlayerToPosition = (player, posId) => {
    // Check if already in XI
    const filtered = playingXI.filter((slot) => slot.position !== posId && slot.player !== player._id && slot.player?._id !== player._id);

    // Overseas check
    if (player.isOverseas && overseasCount >= 4) {
      const existingSlot = playingXI.find((slot) => slot.position === posId);
      const existingPlayer = squad.find((sq) => sq._id === (existingSlot?.player?._id || existingSlot?.player));
      if (!existingPlayer?.isOverseas) {
        addToast('Maximum 4 Overseas players allowed in the Playing XI!', 'warning');
        return;
      }
    }

    setPlayingXI([...filtered, { player: player._id, position: posId }]);
    setSelectedPosition(null);
  };

  // Remove player from position
  const removeFromPosition = (posId) => {
    setPlayingXI(playingXI.filter((slot) => slot.position !== posId));
  };

  // Auto-Pick Best XI algorithm respecting IPL constraints (max 4 overseas, 1 keeper, balance)
  const handleAutoPick = () => {
    if (squad.length === 0) return;

    let selected = [];
    let currentOverseas = 0;

    // Helper to pick top player by role
    const pickPlayer = (role) => {
      return squad.find((p) => {
        if (selected.includes(p._id)) return false;
        if (role && p.role !== role) return false;
        if (p.isOverseas && currentOverseas >= 4) return false;
        return true;
      });
    };

    // 1. Pick 1 Keeper
    let keeper = pickPlayer('WICKET_KEEPER') || squad.find((p) => p.role === 'WICKET_KEEPER');
    if (keeper) {
      selected.push(keeper._id);
      if (keeper.isOverseas) currentOverseas++;
    }

    // 2. Pick 4 Batters
    for (let i = 0; i < 4; i++) {
      const batter = pickPlayer('BATTER');
      if (batter) {
        selected.push(batter._id);
        if (batter.isOverseas) currentOverseas++;
      }
    }

    // 3. Pick 2 All-Rounders
    for (let i = 0; i < 2; i++) {
      const ar = pickPlayer('ALL_ROUNDER');
      if (ar) {
        selected.push(ar._id);
        if (ar.isOverseas) currentOverseas++;
      }
    }

    // 4. Pick Bowlers to fill up to 11
    for (let i = selected.length; i < 11; i++) {
      const bowler = pickPlayer('BOWLER') || pickPlayer(null);
      if (bowler) {
        selected.push(bowler._id);
        if (bowler.isOverseas) currentOverseas++;
      }
    }

    // Map to positions 1-11
    const newXI = selected.map((pid, idx) => ({
      player: pid,
      position: idx + 1
    }));

    setPlayingXI(newXI);
    addToast('Optimal Starting Playing XI generated!', 'info');
  };

  // Save Playing XI to backend
  const handleSave = async () => {
    if (overseasCount > 4) {
      addToast('Cannot save Playing XI with more than 4 Overseas players!', 'danger');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/teams/${team._id}/playing-xi`, { playingXI });
      addToast('Starting Playing XI saved successfully!', 'success');
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save Playing XI', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-3 p-md-4">
      {/* Top Header & Strategic Scorecard */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <TeamLogo team={team} size={30} />
            <h4 className="text-white font-display fw-bold mb-0">{team.name} Starting Playing XI</h4>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.82rem' }}>
            Interactive Tactical Field • Official IPL Squad Regulation (Max 4 Overseas)
          </span>
        </div>

        {/* Tactical Balance Badges */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="glass-panel px-3 py-1 text-center">
            <span className="text-secondary d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>OVERSEAS</span>
            <span className={`fw-bold font-display ${overseasCount > 4 ? 'text-danger' : 'text-info'}`} style={{ fontSize: '1rem' }}>
              {overseasCount} / 4
            </span>
          </div>

          <div className="glass-panel px-3 py-1 text-center">
            <span className="text-secondary d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>BAT DEPTH</span>
            <span className="text-success fw-bold font-display" style={{ fontSize: '1rem' }}>{battingDepthScore}%</span>
          </div>

          <div className="glass-panel px-3 py-1 text-center">
            <span className="text-secondary d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>BOWL FIRE</span>
            <span className="text-warning fw-bold font-display" style={{ fontSize: '1rem' }}>{bowlingAttackScore}%</span>
          </div>

          <div className="glass-panel px-3 py-1 text-center" style={{ border: '1px solid #00f0ff' }}>
            <span className="text-secondary d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>TEAM BALANCE</span>
            <span className="text-info fw-bold font-display" style={{ fontSize: '1.1rem' }}>{teamBalance}/100</span>
          </div>
        </div>
      </div>

      {/* Main Tactical Section */}
      <div className="row g-4">
        {/* LEFT: Cricket Field Pitch View */}
        <div className="col-lg-8">
          <div
            className="position-relative overflow-hidden rounded-4 shadow-lg"
            style={{
              background: 'radial-gradient(circle at center, #1b5e20 0%, #0d3b13 70%, #08240b 100%)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              minHeight: '520px',
              aspectRatio: '16/11'
            }}
          >
            {/* Boundary Rope & Inner Circle */}
            <div
              style={{
                position: 'absolute',
                inset: '2%',
                border: '2px dashed rgba(255, 255, 255, 0.35)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                inset: '22%',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            ></div>

            {/* Central Cricket Pitch Turf Strip */}
            <div
              style={{
                position: 'absolute',
                left: '46%',
                top: '28%',
                width: '8%',
                height: '44%',
                background: 'linear-gradient(to bottom, #8d6e63, #a1887f 50%, #8d6e63)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Bowling Crease & Stumps */}
              <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', height: '2px', backgroundColor: '#fff' }}></div>
              <div style={{ position: 'absolute', bottom: '10%', left: '10%', right: '10%', height: '2px', backgroundColor: '#fff' }}></div>
              <div style={{ position: 'absolute', top: '5%', left: '30%', right: '30%', height: '3px', backgroundColor: '#ffd700' }}></div>
              <div style={{ position: 'absolute', bottom: '5%', left: '30%', right: '30%', height: '3px', backgroundColor: '#ffd700' }}></div>
            </div>

            {/* 11 Position Slots */}
            {DEFAULT_POSITIONS.map((pos) => {
              const assignedSlot = playingXI.find((slot) => slot.position === pos.id);
              const player = squad.find((sq) => sq._id === (assignedSlot?.player?._id || assignedSlot?.player));
              const isSelected = selectedPosition === pos.id;

              return (
                <div
                  key={pos.id}
                  onClick={() => setSelectedPosition(isSelected ? null : pos.id)}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  className="text-center"
                >
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle transition-all ${
                      isSelected ? 'ring-active' : ''
                    }`}
                    style={{
                      width: '46px',
                      height: '46px',
                      backgroundColor: player ? (player.isOverseas ? '#1a237e' : '#004d40') : 'rgba(0, 0, 0, 0.65)',
                      border: isSelected ? '3px solid #00f0ff' : player ? '2px solid #ffd700' : '2px dashed rgba(255,255,255,0.4)',
                      boxShadow: player ? '0 4px 15px rgba(0,0,0,0.6)' : 'none'
                    }}
                  >
                    {player ? (
                      player.image ? (
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-100 h-100 rounded-circle"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="text-white fw-bold font-display" style={{ fontSize: '0.85rem' }}>
                          {player.name.charAt(0)}
                        </span>
                      )
                    ) : (
                      <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                        #{pos.id}
                      </span>
                    )}
                  </div>

                  {/* Player Name Tag */}
                  <div
                    className="px-2 py-0.5 rounded mt-1 text-nowrap"
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      fontSize: '0.7rem',
                      maxWidth: '90px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: player ? '#fff' : '#aaa',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {player ? player.name.split(' ').pop() : pos.name}
                    {player?.isOverseas && <span className="ms-1">✈️</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Squad Selection & Position Assignment */}
        <div className="col-lg-4 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="text-white font-display fw-bold mb-0">
                {selectedPosition ? `Assign #${selectedPosition} Position` : 'Team Roster Available'}
              </h6>
              <button
                type="button"
                onClick={handleAutoPick}
                className="btn btn-sm btn-premium-glass"
                style={{ fontSize: '0.75rem' }}
              >
                ⚡ Auto-Pick Best XI
              </button>
            </div>

            {selectedPosition && (
              <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: '0.8rem' }}>
                <span>Select a player below to slot in:</span>
                <button
                  type="button"
                  onClick={() => removeFromPosition(selectedPosition)}
                  className="btn btn-sm btn-outline-danger py-0 px-2"
                  style={{ fontSize: '0.72rem' }}
                >
                  Clear Slot
                </button>
              </div>
            )}

            {/* Squad List */}
            <div
              className="d-flex flex-column gap-2 overflow-y-auto pe-1"
              style={{ maxHeight: '380px' }}
            >
              {squad.map((player) => {
                const assignedSlot = playingXI.find((slot) => slot.player === player._id || slot.player?._id === player._id);
                const isInXI = !!assignedSlot;

                return (
                  <div
                    key={player._id}
                    onClick={() => {
                      if (selectedPosition) {
                        assignPlayerToPosition(player, selectedPosition);
                      } else {
                        // Select next empty position
                        const emptyPos = DEFAULT_POSITIONS.find((pos) => !playingXI.some((slot) => slot.position === pos.id));
                        if (emptyPos) assignPlayerToPosition(player, emptyPos.id);
                      }
                    }}
                    className={`d-flex align-items-center justify-content-between p-2 rounded-3 transition-all ${
                      isInXI ? 'bg-dark border border-secondary border-opacity-50' : 'glass-panel'
                    }`}
                    style={{
                      cursor: 'pointer',
                      opacity: isInXI ? 0.75 : 1
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={player.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100'}
                        alt={player.name}
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="text-white fw-semibold" style={{ fontSize: '0.82rem' }}>
                          {player.name} {player.isOverseas && '✈️'}
                        </div>
                        <span className={`badge-role ${getRoleBadgeClass(player.role)}`} style={{ fontSize: '0.62rem' }}>
                          {getRoleName(player.role)}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isInXI ? (
                        <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                          #{assignedSlot.position} XI
                        </span>
                      ) : (
                        <span className="badge bg-secondary text-white" style={{ fontSize: '0.7rem' }}>
                          + Assign
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {squad.length === 0 && (
                <div className="text-center text-muted py-4">
                  No players purchased yet in this auction.
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || squad.length === 0}
              className="btn btn-premium-accent w-100 py-2 fw-bold font-display"
              style={{ borderRadius: '12px' }}
            >
              {saving ? 'Saving Starting XI...' : '💾 Save Starting Playing XI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalPitchBoard;
