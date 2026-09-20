import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatPurse } from '../utils/formatters';
import { teamService } from '../services/teamService';
import TeamLogo from '../components/common/TeamLogo';

const Profile = () => {
  const { user, logout, isTeamOwner, isAdmin, assignFranchise } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [savingTeam, setSavingTeam] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getTeams();
        if (data && data.length > 0) {
          setTeams(data);
          setSelectedTeamId(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch teams in profile:', err.message);
      }
    };
    fetchTeams();
  }, []);

  const handleAssignFranchise = async () => {
    if (!selectedTeamId) return;
    setSavingTeam(true);
    try {
      await assignFranchise(selectedTeamId);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTeam(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl" style={{ maxWidth: '900px' }}>
        <div className="glass-card p-4 p-md-5 mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-4 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #ffb300 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#000'
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-white font-display fw-bold mb-1">{user.name}</h3>
                <div className="text-secondary" style={{ fontSize: '0.9rem' }}>{user.email}</div>
              </div>
            </div>

            <div>
              <span
                className="badge py-2 px-3"
                style={{
                  background:
                    user.role === 'ADMIN'
                      ? 'rgba(255, 23, 68, 0.2)'
                      : user.role === 'TEAM_OWNER'
                      ? 'rgba(255, 179, 0, 0.2)'
                      : 'rgba(0, 240, 255, 0.2)',
                  color:
                    user.role === 'ADMIN'
                      ? '#ff5252'
                      : user.role === 'TEAM_OWNER'
                      ? '#ffb300'
                      : '#00f0ff',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                  fontSize: '0.85rem'
                }}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* If Team Owner or unassigned, show franchise details */}
          {(isTeamOwner || !user.team) && (
            <div className="mb-4">
              <h5 className="text-white font-display fw-bold mb-3">FRANCHISE DETAILS</h5>
              {user.team ? (
                <div className="glass-panel p-4">
                  <div className="row g-3 align-items-center justify-content-between">
                    <div className="col-md-6 d-flex align-items-center gap-3">
                      <TeamLogo team={user.team} size={48} />
                      <div>
                        <h4 className="text-white font-display fw-bold mb-1">{user.team.name}</h4>
                        <span className="badge bg-secondary">{user.team.shortName}</span>
                      </div>
                    </div>

                    <div className="col-md-6 text-md-end">
                      <div className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Remaining Purse
                      </div>
                      <div className="text-success font-display fw-bold fs-3">
                        {formatPurse(user.team.remainingPurse)}
                      </div>
                      <Link to={`/teams/${user.team._id || user.team}`} className="btn btn-sm btn-premium-glass mt-2">
                        Manage Squad <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-4" style={{ borderRadius: '12px' }}>
                  <div className="d-flex align-items-center gap-2 text-warning mb-2">
                    <i className="bi bi-shield-exclamation fs-5"></i>
                    <div className="fw-bold">No Franchise Currently Linked</div>
                  </div>
                  <p className="text-secondary mb-3" style={{ fontSize: '0.88rem' }}>
                    Select an official IPL franchise below to link to your account for live bidding and squad management:
                  </p>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <select
                      className="form-select form-select-dark"
                      style={{ maxWidth: '380px' }}
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.shortName}) — ₹{(t.remainingPurse / 10000000).toFixed(1)} Cr Purse
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={savingTeam}
                      onClick={handleAssignFranchise}
                      className="btn btn-premium-gold px-4"
                    >
                      {savingTeam ? 'Linking...' : 'Link Franchise'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-secondary border-opacity-25">
            {isAdmin && (
              <Link to="/admin/dashboard" className="btn btn-premium-accent">
                <i className="bi bi-speedometer2 me-1"></i> Admin Console
              </Link>
            )}
            <Link to="/live" className="btn btn-premium-gold">
              <i className="bi bi-broadcast me-1"></i> Enter Live Auction
            </Link>
            <button onClick={logout} className="btn btn-danger-glow ms-auto">
              <i className="bi bi-box-arrow-right me-1"></i> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
