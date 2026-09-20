import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, rgba(6, 11, 23, 0.7) 0%, #03060c 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '60px 0 30px',
        marginTop: '80px',
        position: 'relative'
      }}
    >
      <div className="container-xl">
        <div className="row g-4 justify-content-between mb-5">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 mb-3 text-decoration-none">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))'
                }}
              >
                <img src="/trophy-logo.png" alt="IPL Trophy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: '900',
                  letterSpacing: '-0.02em',
                  color: '#fff'
                }}
              >
                AUCTION<span style={{ color: 'var(--gold)' }}>X</span>
              </span>
            </Link>
            <p className="text-secondary" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
              "Where strategy meets cricket." The next-generation live cricket auction platform delivering real-time bidding, tactical purse allocation, and television broadcast-grade experiences.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a
                href="https://www.linkedin.com/in/borra-prashanth-0529a9278/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-premium-glass d-inline-flex align-items-center justify-content-center"
                title="LinkedIn - Borra Prashanth"
                style={{ width: '36px', height: '36px', borderRadius: '8px', color: '#00a0dc' }}
              >
                <i className="bi bi-linkedin fs-5"></i>
              </a>
              <a
                href="https://github.com/Prashanthgit12"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-premium-glass d-inline-flex align-items-center justify-content-center"
                title="GitHub - Prashanthgit12"
                style={{ width: '36px', height: '36px', borderRadius: '8px', color: '#fff' }}
              >
                <i className="bi bi-github fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 font-display">PLATFORM</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/live" className="text-secondary text-decoration-none hover-white">Live Auction</Link></li>
              <li><Link to="/players" className="text-secondary text-decoration-none hover-white">Players Pool</Link></li>
              <li><Link to="/teams" className="text-secondary text-decoration-none hover-white">Franchises</Link></li>
              <li><Link to="/leaderboard" className="text-secondary text-decoration-none hover-white">Leaderboard</Link></li>
              <li><Link to="/history" className="text-secondary text-decoration-none hover-white">Auction History</Link></li>
            </ul>
          </div>

          {/* Legal / Rules */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 font-display">RULES & FAQS</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><span className="text-secondary">Purse Limit (₹120 Cr)</span></li>
              <li><span className="text-secondary">Squad Cap (25 Players)</span></li>
              <li><span className="text-secondary">Overseas Limit (8 Max)</span></li>
              <li><span className="text-secondary">Anti-Snipe Protection</span></li>
              <li><span className="text-secondary">Fair Play Guidelines</span></li>
            </ul>
          </div>

          {/* System Status */}
          <div className="col-lg-3 col-md-6">
            <div className="glass-panel p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pulse-live-badge" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e676', display: 'inline-block' }}></span>
                <span className="text-success fw-bold" style={{ fontSize: '0.8rem' }}>SYSTEMS OPERATIONAL</span>
              </div>
              <p className="text-muted mb-2" style={{ fontSize: '0.82rem' }}>
                Real-time Socket.IO synchronization active with authoritative anti-sniping timers.
              </p>
              <div className="text-white-50" style={{ fontSize: '0.78rem' }}>
                Server latency: &lt; 20ms
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} AUCTIONX. Built for elite cricket franchises.
          </div>
          <div className="d-flex gap-4 text-secondary" style={{ fontSize: '0.85rem' }}>
            <a href="#" className="hover-white text-decoration-none">Terms of Service</a>
            <a href="#" className="hover-white text-decoration-none">Privacy Policy</a>
            <a href="#" className="hover-white text-decoration-none">API Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
