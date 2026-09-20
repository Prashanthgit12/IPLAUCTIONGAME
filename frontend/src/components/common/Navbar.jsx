import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleSound, isSoundEnabled } from '../../utils/soundEffects';
import { useWishlist } from '../../context/WishlistContext';
import WishlistModal from '../players/WishlistModal';

const Navbar = () => {
  const { user, logout, isAdmin, isTeamOwner } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(isSoundEnabled());
  const [wishlistOpen, setWishlistOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const state = toggleSound();
    setSoundActive(state);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        scrolled ? 'navbar-scrolled' : ''
      }`}
      style={{
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(6, 11, 23, 0.95)'
          : 'rgba(6, 11, 23, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1030,
        padding: '6px 0'
      }}
    >
      <div className="container-xl">
        {/* Brand Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.45))'
            }}
          >
            <img src="/trophy-logo.png" alt="IPL Trophy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: '900',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 0%, #00f0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            AUCTION<span style={{ color: 'var(--gold)' }}>X</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <button
            onClick={handleSoundToggle}
            className="btn btn-sm btn-premium-glass px-2 py-1"
            title={soundActive ? 'Mute Sounds' : 'Unmute Sounds'}
            style={{ fontSize: '0.8rem' }}
          >
            <i className={`bi ${soundActive ? 'bi-volume-up-fill text-info' : 'bi-volume-mute-fill text-muted'}`}></i>
          </button>
          <button
            className="navbar-toggler border-0 text-white"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
          </button>
        </div>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-0 text-center py-2 py-lg-0">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link text-white-50 px-2 py-1 fw-semibold"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/live"
                className="nav-link px-2 py-1 fw-bold d-inline-flex align-items-center gap-1.5 justify-content-center"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#ff5252', fontSize: '0.82rem' }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#ff1744',
                    display: 'inline-block'
                  }}
                  className="pulse-live-badge"
                ></span>
                Live Auction
              </Link>
            </li>
            <li className="nav-item">
              <a
                href="/#play-with-friends"
                className="nav-link text-warning px-2 py-1 fw-bold d-inline-flex align-items-center gap-1"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('play-with-friends');
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{ fontSize: '0.82rem' }}
              >
                <i className="bi bi-people-fill" style={{ fontSize: '0.8rem' }}></i>
                Play With Friends
              </a>
            </li>
            <li className="nav-item">
              <Link
                to="/trades"
                className="nav-link text-info px-2 py-1 fw-bold d-inline-flex align-items-center gap-1"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                <i className="bi bi-arrow-left-right" style={{ fontSize: '0.8rem' }}></i>
                Trade Desk
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/players"
                className="nav-link text-white-50 px-2 py-1 fw-semibold"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Players
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/teams"
                className="nav-link text-white-50 px-2 py-1 fw-semibold"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Teams
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/history"
                className="nav-link text-white-50 px-2 py-1 fw-semibold"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Results
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/leaderboard"
                className="nav-link text-white-50 px-2 py-1 fw-semibold"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Leaderboard
              </Link>
            </li>
          </ul>

          {/* Right Action Menu */}
          <div className="d-flex align-items-center justify-content-center gap-2 mt-3 mt-lg-0">
            {/* Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              className="btn btn-premium-glass d-none d-lg-inline-flex p-1 align-items-center justify-content-center"
              title={soundActive ? 'Sound FX Enabled' : 'Sound FX Muted'}
              style={{ width: '32px', height: '32px', borderRadius: '8px' }}
            >
              <i className={`bi ${soundActive ? 'bi-volume-up-fill text-info' : 'bi-volume-mute-fill text-muted'}`} style={{ fontSize: '0.85rem' }}></i>
            </button>

            {/* Target Board (Wishlist) Button */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="btn btn-premium-glass d-inline-flex align-items-center gap-1 px-2 py-1"
              title="Franchise Target Board"
              style={{ borderRadius: '8px', fontSize: '0.78rem' }}
            >
              <span style={{ fontSize: '0.85rem' }}>🎯</span>
              <span className="d-none d-sm-inline fw-semibold text-white">Targets</span>
              {wishlistCount > 0 && (
                <span
                  className="badge bg-warning text-dark rounded-pill fw-bold"
                  style={{ fontSize: '0.62rem', padding: '1px 5px' }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-premium-glass d-flex align-items-center gap-1.5 dropdown-toggle py-0.5 px-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  id="userDropdown"
                  aria-expanded="false"
                  style={{ borderRadius: '24px' }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00f0ff 0%, #ffb300 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#000',
                      fontSize: '0.75rem'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-start d-none d-sm-block">
                    <div style={{ fontSize: '0.78rem', lineHeight: '1.1', fontWeight: '600' }}>
                      {user.name}
                    </div>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        padding: '0px 5px',
                        borderRadius: '8px',
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
                        fontWeight: '700'
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                </button>

                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg"
                  aria-labelledby="userDropdown"
                  style={{
                    background: '#0a1324',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    minWidth: '200px',
                    padding: '8px 0'
                  }}
                >
                  <li>
                    <Link to="/profile" className="dropdown-item text-white py-2 px-3" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-person-circle me-2 text-info"></i> Profile
                    </Link>
                  </li>

                  {isAdmin && (
                    <>
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item text-white py-2 px-3" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-speedometer2 me-2 text-warning"></i> Admin Console
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/auction-control" className="dropdown-item text-white py-2 px-3" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-broadcast me-2 text-danger"></i> Live Control
                        </Link>
                      </li>
                    </>
                  )}

                  {isTeamOwner && user.team && (
                    <li>
                      <Link to={`/teams/${user.team._id || user.team}`} className="dropdown-item text-white py-2 px-3" style={{ fontSize: '0.85rem' }}>
                        <i className="bi bi-shield-shaded me-2 text-success"></i> My Squad & Purse
                      </Link>
                    </li>
                  )}

                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger py-2 px-3"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-1.5">
                <Link to="/login" className="btn btn-premium-glass" style={{ padding: '4px 12px', fontSize: '0.80rem', borderRadius: '8px' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-premium-accent" style={{ padding: '4px 12px', fontSize: '0.80rem', borderRadius: '8px' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Board Wishlist Modal */}
      <WishlistModal isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </nav>
  );
};

export default Navbar;
