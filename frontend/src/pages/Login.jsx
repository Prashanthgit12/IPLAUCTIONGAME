import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.user?.role === 'TEAM_OWNER') {
        navigate('/live');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
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
          maxWidth: '1000px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div className="row g-0">
          {/* Left Column: Visual & Feature Highlights */}
          <div
            className="col-lg-6 p-5 d-flex flex-column justify-content-between position-relative"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 75, 160, 0.4) 0%, rgba(6, 11, 23, 0.95) 100%)',
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
                Enter The War Room. Build Your Squad.
              </h2>
              <p className="text-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                Sign in to place real-time bids, manage your franchise purse, and compete for the world's most sought-after cricket talent.
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', minWidth: '36px', height: '36px' }}>
                    <i className="bi bi-broadcast"></i>
                  </div>
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: '0.9rem' }}>Real-Time Live Bidding</div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Live auction timer, rapid bids, and AI counter-bids</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: 'rgba(253, 185, 19, 0.15)', color: '#fdb913', minWidth: '36px', height: '36px' }}>
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: '0.9rem' }}>₹120 Cr Franchise Purse</div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Track purse balances, overseas slots, and RTM cards</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', minWidth: '36px', height: '36px' }}>
                    <i className="bi bi-arrow-left-right"></i>
                  </div>
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: '0.9rem' }}>Franchise Trade Window</div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Negotiate bilateral trades and cash adjustments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Account Banner */}
            <div className="p-3 glass-panel" style={{ borderRadius: '12px' }}>
              <div className="text-white fw-bold mb-1" style={{ fontSize: '0.85rem' }}>
                Need a new account?
              </div>
              <p className="text-secondary mb-2" style={{ fontSize: '0.78rem' }}>
                Create a newly registered Team Owner, Admin, or Spectator account to get started immediately.
              </p>
              <Link to="/register" className="btn btn-sm btn-outline-info w-100 fw-bold">
                <i className="bi bi-person-plus-fill me-1"></i> Create New Account
              </Link>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center">
            <h3 className="text-white font-display fw-bold mb-1">SIGN IN</h3>
            <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
              Enter your franchise credentials to continue
            </p>

            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-exclamation-octagon-fill"></i>
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
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

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="text-secondary fw-semibold" style={{ fontSize: '0.82rem' }}>
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  className="form-control form-control-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-premium-accent w-100 py-3 mt-3 mb-3"
                style={{ fontSize: '1rem' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                )}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="text-center text-secondary" style={{ fontSize: '0.88rem' }}>
                Don't have an account?{' '}
                <Link to="/register" className="text-info fw-bold text-decoration-none">
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
