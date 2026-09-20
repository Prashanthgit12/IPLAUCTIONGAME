import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('TEAM_OWNER');
  
  // Franchise selection for Team Owner
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [isCustomTeam, setIsCustomTeam] = useState(false);
  const [customTeamName, setCustomTeamName] = useState('');
  const [customShortName, setCustomShortName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const data = await teamService.getTeams();
      if (data && data.length > 0) {
        setTeams(data);
        setSelectedTeamId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load teams for registration:', err.message);
    } finally {
      setTeamsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (role === 'TEAM_OWNER' && isCustomTeam) {
      if (!customTeamName.trim() || !customShortName.trim()) {
        setErrorMsg('Please specify both your custom team name and short code');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role
      };

      if (role === 'TEAM_OWNER') {
        if (isCustomTeam) {
          payload.newTeamName = customTeamName.trim();
          payload.newTeamShortName = customShortName.trim().toUpperCase();
        } else if (selectedTeamId) {
          payload.teamId = selectedTeamId;
        }
      }

      const res = await register(payload);
      const userRole = res?.user?.role || role;

      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'TEAM_OWNER') {
        navigate('/live');
      } else {
        navigate('/live');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 20px 60px',
        position: 'relative'
      }}
    >
      <div
        className="glass-card overflow-hidden shadow-lg"
        style={{
          maxWidth: '1040px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div className="row g-0">
          {/* Left Visual */}
          <div
            className="col-lg-5 p-5 d-flex flex-column justify-content-between position-relative"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.4) 0%, rgba(6, 11, 23, 0.95) 100%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <div className="d-flex align-items-center gap-2 mb-4">
                <span style={{ fontSize: '2rem' }}>🏏</span>
                <span className="font-display fw-bold text-white fs-3">
                  AUCTION<span style={{ color: 'var(--gold)' }}>X</span>
                </span>
              </div>

              <h2 className="text-white font-display fw-bold mb-3" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
                Join The Premier Cricket Auction.
              </h2>
              <p className="text-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                Create your newly registered account to take ownership of an IPL franchise, manage tournament auctions, or experience real-time bidding.
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: 'rgba(253, 185, 19, 0.15)', color: '#fdb913', minWidth: '34px', height: '34px' }}>
                    <i className="bi bi-trophy-fill"></i>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    <span className="text-white fw-bold">Official IPL Franchises:</span> Select your favorite club or form a custom team.
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', minWidth: '34px', height: '34px' }}>
                    <i className="bi bi-shield-shaded"></i>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    <span className="text-white fw-bold">Tournament Admin:</span> Take full control of auction clock, sets & squads.
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', minWidth: '34px', height: '34px' }}>
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                    <span className="text-white fw-bold">Instant Activation:</span> Jump directly into live bidding with ₹120 Cr purse.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 glass-panel" style={{ borderRadius: '12px' }}>
              <div className="text-white fw-bold mb-1" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-person-check-fill text-success me-1"></i> FRESH ACCOUNT SETUP
              </div>
              <p className="text-secondary mb-0" style={{ fontSize: '0.78rem' }}>
                All newly created accounts have full access to bidding, roster management, and trade desks.
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="col-lg-7 p-4 p-md-5">
            <h3 className="text-white font-display fw-bold mb-1">CREATE ACCOUNT</h3>
            <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
              Register your newly created credentials to enter the auction
            </p>

            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-exclamation-octagon-fill"></i>
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-dark"
                    placeholder="e.g. Vikram Singhania"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="form-control form-control-dark"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="mb-3">
                <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>
                  Account Role
                </label>
                <select
                  className="form-select form-select-dark"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="TEAM_OWNER">🏏 Team Owner (Manage Franchise & Place Live Bids)</option>
                  <option value="VIEWER">👀 Spectator / Viewer (Watch Live Streams & Stats)</option>
                </select>
              </div>

              {/* Franchise Selection if Team Owner */}
              {role === 'TEAM_OWNER' && (
                <div className="p-3 mb-3 glass-panel" style={{ borderRadius: '10px', border: '1px solid rgba(253, 185, 19, 0.3)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-warning fw-bold mb-0" style={{ fontSize: '0.82rem', letterSpacing: '0.04em' }}>
                      <i className="bi bi-shield-fill me-1"></i> SELECT YOUR FRANCHISE
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-info p-0 text-decoration-none"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => setIsCustomTeam(!isCustomTeam)}
                    >
                      {isCustomTeam ? '← Choose Existing Franchise' : '+ Create Custom Franchise'}
                    </button>
                  </div>

                  {!isCustomTeam ? (
                    <div>
                      {teamsLoading ? (
                        <div className="text-secondary py-2 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                          <span className="spinner-border spinner-border-sm text-warning" role="status"></span>
                          <span>Loading franchises...</span>
                        </div>
                      ) : teams.length === 0 ? (
                        <div className="text-warning py-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.85rem' }}>
                          <span>Unable to load franchises.</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info py-0 px-2"
                            onClick={fetchTeams}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <select
                          className="form-select form-select-dark"
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                        >
                          {teams.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.shortName}) — ₹{(t.remainingPurse / 10000000).toFixed(1)} Cr Purse
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>
                        Your new account will officially own this franchise in the live bidding and trading desk.
                      </div>
                    </div>
                  ) : (
                    <div className="row g-2">
                      <div className="col-8">
                        <input
                          type="text"
                          required
                          className="form-control form-control-dark form-control-sm"
                          placeholder="Team Name (e.g. Goa Strikers)"
                          value={customTeamName}
                          onChange={(e) => setCustomTeamName(e.target.value)}
                        />
                      </div>
                      <div className="col-4">
                        <input
                          type="text"
                          required
                          maxLength={4}
                          className="form-control form-control-dark form-control-sm"
                          placeholder="Code (e.g. GS)"
                          value={customShortName}
                          onChange={(e) => setCustomShortName(e.target.value)}
                        />
                      </div>
                      <div className="col-12 text-secondary" style={{ fontSize: '0.75rem' }}>
                        Will be initialized with standard ₹120 Cr IPL auction purse.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="form-control form-control-dark"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    className="form-control form-control-dark"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-premium-accent w-100 py-3 mb-3"
                style={{ fontSize: '1rem' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-person-check-fill me-2"></i>
                )}
                {loading ? 'Creating Your Account...' : 'Complete Registration'}
              </button>

              <div className="text-center text-secondary" style={{ fontSize: '0.88rem' }}>
                Already registered?{' '}
                <Link to="/login" className="text-info fw-bold text-decoration-none">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
