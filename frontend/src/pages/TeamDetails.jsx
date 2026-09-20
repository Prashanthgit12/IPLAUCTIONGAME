import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import TacticalPitchBoard from '../components/teams/TacticalPitchBoard';
import BroadcastSquadCardExport from '../components/teams/BroadcastSquadCardExport';
import SquadChemistryMeter from '../components/teams/SquadChemistryMeter';
import TradeDeskModal from '../components/teams/TradeDeskModal';
import TeamLogo from '../components/common/TeamLogo';
import { formatPurse, getRoleBadgeClass, getRoleName } from '../utils/formatters';

const TeamDetails = () => {
  const { id } = useParams();
  const { user, isTeamOwner } = useAuth();
  const [team, setTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PITCH'); // PITCH, ROSTER
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await teamService.getTeamById(id);
        setTeam(res);
        const allRes = await teamService.getTeams();
        if (allRes?.data) setAllTeams(allRes.data);
      } catch (err) {
        console.error('Failed to load team details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container py-5 text-center" style={{ paddingTop: '100px' }}>
        <h3 className="text-white">Team not found</h3>
        <Link to="/teams" className="btn btn-premium-accent mt-3">Back to Teams</Link>
      </div>
    );
  }

  const squadSections = [
    { title: 'BATTERS', list: team.categorizedSquad?.batters || [] },
    { title: 'ALL-ROUNDERS', list: team.categorizedSquad?.allRounders || [] },
    { title: 'WICKET-KEEPERS', list: team.categorizedSquad?.wicketKeepers || [] },
    { title: 'BOWLERS', list: team.categorizedSquad?.bowlers || [] }
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link to="/teams" className="text-secondary text-decoration-none hover-white" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-arrow-left me-1"></i> Back to Teams
          </Link>
        </div>

        {/* Team Hero Header */}
        <div
          className="broadcast-card p-4 p-md-5 mb-5 position-relative overflow-hidden"
          style={{
            borderLeft: `6px solid ${team.primaryColor || '#00f0ff'}`
          }}
        >
          <div className="row g-4 align-items-center justify-content-between">
            <div className="col-lg-7 d-flex align-items-center gap-4">
              <div
                style={{
                  width: '85px',
                  height: '85px',
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${team.primaryColor || '#00f0ff'} 0%, ${team.secondaryColor || '#000'} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  flexShrink: 0,
                  padding: '8px'
                }}
              >
                <TeamLogo team={team} size={62} />
              </div>

              <div>
                <span className="badge bg-secondary mb-1">{team.shortName}</span>
                <h1 className="text-white font-display fw-bold mb-1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
                  {team.name}
                </h1>
                <div className="text-secondary" style={{ fontSize: '0.92rem' }}>
                  Owner: <strong className="text-white">{team.owner?.name || 'Franchise Management'}</strong>
                </div>
              </div>
            </div>

            {/* Remaining Purse Box */}
            <div className="col-lg-4 text-lg-end">
              <div className="glass-panel p-3 d-inline-block text-start w-100" style={{ maxWidth: '320px' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Remaining Purse
                </span>
                <div className="text-success font-display fw-bold" style={{ fontSize: '1.8rem' }}>
                  {formatPurse(team.remainingPurse)}
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Initial Purse: {formatPurse(team.initialPurse)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="row g-3 mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
            <div className="col-sm-3 col-6">
              <div className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Total Players</div>
              <div className="text-white font-display fw-bold fs-4">{team.squadCount} / {team.maxSquadSize}</div>
            </div>
            <div className="col-sm-3 col-6">
              <div className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Overseas Players</div>
              <div className="text-info font-display fw-bold fs-4">{team.overseasCount} / {team.maxOverseas}</div>
            </div>
            <div className="col-sm-3 col-6">
              <div className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Total Spent</div>
              <div className="text-warning font-display fw-bold fs-4">{formatPurse(team.totalSpent)}</div>
            </div>
            <div className="col-sm-3 col-6">
              <div className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Slots Remaining</div>
              <div className="text-white font-display fw-bold fs-4">{team.remainingSlots}</div>
            </div>
          </div>
        </div>

        {/* Squad Chemistry & Power Analysis Meter */}
        <div className="mb-5">
          <SquadChemistryMeter squad={team.players || []} teamName={team.name} />
        </div>

        {/* Tab Navigation & Export Button */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="btn-group">
            <button
              type="button"
              onClick={() => setActiveTab('PITCH')}
              className={`btn py-2 px-4 fw-bold font-display ${activeTab === 'PITCH' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
              style={{ borderRadius: '12px 0 0 12px' }}
            >
              🏏 Tactical Playing XI Board
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ROSTER')}
              className={`btn py-2 px-4 fw-bold font-display ${activeTab === 'ROSTER' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
              style={{ borderRadius: '0 12px 12px 0' }}
            >
              📋 Full Squad Roster ({team.squadCount || 0})
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTradeModal(true)}
              className="btn btn-outline-info py-2 px-3 d-flex align-items-center gap-2"
              style={{ borderRadius: '12px' }}
            >
              <span>🤝</span>
              <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Trade Desk</span>
            </button>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="btn btn-premium-glass py-2 px-3 d-flex align-items-center gap-2"
              style={{ borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.4)' }}
            >
              <span>📜</span>
              <span className="fw-semibold text-warning" style={{ fontSize: '0.9rem' }}>Official Squad Certificate</span>
            </button>
          </div>
        </div>

        {/* Content Display */}
        {activeTab === 'PITCH' ? (
          <TacticalPitchBoard
            team={team}
            isOwner={isTeamOwner && user?.team?._id === team._id}
            onTeamUpdated={() => {
              teamService.getTeamById(id).then((t) => setTeam(t));
            }}
          />
        ) : (
          /* Squad Breakdown By Role */
          <div className="d-flex flex-column gap-5">
            {squadSections.map((section, idx) => (
              <div key={idx}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <h4 className="text-white font-display fw-bold mb-0">{section.title}</h4>
                  <span className="badge bg-secondary text-white-50">{section.list.length}</span>
                </div>

                {section.list.length === 0 ? (
                  <div className="glass-panel p-4 text-center text-muted" style={{ borderRadius: '12px' }}>
                    No {section.title.toLowerCase()} currently acquired in squad.
                  </div>
                ) : (
                  <div className="row g-3">
                    {section.list.map((item, pIdx) => {
                      const p = item.player;
                      if (!p) return null;

                      return (
                        <div key={p._id || pIdx} className="col-lg-3 col-md-6 col-12">
                          <div className="glass-card p-3 d-flex align-items-center gap-3">
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'}
                              alt={p.name}
                              style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                objectFit: 'cover'
                              }}
                            />
                            <div className="flex-grow-1 overflow-hidden">
                              <h6 className="text-white fw-bold mb-0 text-truncate">{p.name}</h6>
                              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                {p.country} {p.isOverseas && '✈️'}
                              </span>
                              <div className="text-success font-display fw-bold" style={{ fontSize: '0.88rem' }}>
                                {formatPurse(item.buyPrice)}
                              </div>
                            </div>
                            <Link to={`/players/${p._id}`} className="btn btn-sm btn-premium-glass px-2">
                              <i className="bi bi-chevron-right"></i>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Broadcast Squad Card Export Modal */}
        {showExportModal && (
          <BroadcastSquadCardExport
            team={team}
            onClose={() => setShowExportModal(false)}
          />
        )}

        {/* Franchise Trade Desk Modal */}
        {showTradeModal && (
          <TradeDeskModal
            currentTeam={team}
            allTeams={allTeams}
            onClose={() => setShowTradeModal(false)}
            onTradeCompleted={() => {
              teamService.getTeamById(id).then((t) => setTeam(t));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TeamDetails;
