import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerService } from '../services/playerService';
import { teamService } from '../services/teamService';
import { auctionService } from '../services/auctionService';
import PlayerCard from '../components/cards/PlayerCard';
import TeamCard from '../components/cards/TeamCard';
import MarqueeCardStack from '../components/common/MarqueeCardStack';
import PlayWithFriendsSection from '../components/home/PlayWithFriendsSection';
import TestimonialMarquee from '../components/home/TestimonialMarquee';
import { formatPurse, formatCrore } from '../utils/formatters';

const Home = () => {
  const [featuredPlayers, setFeaturedPlayers] = useState([]);
  const [featuredTeams, setFeaturedTeams] = useState([]);
  const [activeAuction, setActiveAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes, auctionRes] = await Promise.all([
          playerService.getPlayers({ limit: 4, category: 'MARQUEE' }),
          teamService.getTeams(),
          auctionService.getActiveAuction().catch(() => null)
        ]);

        if (playersRes?.data) setFeaturedPlayers(playersRes.data.slice(0, 4));
        if (teamsRes) setFeaturedTeams(teamsRes.slice(0, 3));
        if (auctionRes?.auction) setActiveAuction(auctionRes.auction);
      } catch (err) {
        console.error('Failed to load home page assets:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      {/* HERO SECTION - Matches User Reference Mockup */}
      <section
        className="position-relative py-5 py-lg-6 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 30% 25%, rgba(0, 75, 160, 0.22) 0%, rgba(6, 11, 23, 0.98) 75%)'
        }}
      >
        <div className="container-xl position-relative" style={{ zIndex: 2 }}>
          <div className="row g-5 align-items-center">
            {/* Left Column: Heading, Copy, At a Glance, Action Buttons */}
            <div className="col-lg-7 text-start">
              {/* Category Pill Tagline */}
              <div className="d-inline-flex align-items-center gap-2 mb-3">
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '900',
                    letterSpacing: '0.14em',
                    color: '#fdb913',
                    textTransform: 'uppercase'
                  }}
                >
                  LIVE CRICKET AUCTION SIMULATOR
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="display-title fw-bold mb-3 text-white"
                style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.03em'
                }}
              >
                IPL AUCTION<br />
                <span
                  style={{
                    color: '#fdb913',
                    textShadow: '0 0 35px rgba(253, 185, 19, 0.35)'
                  }}
                >
                  ONLINE GAME
                </span>
              </h1>

              {/* Descriptive Copy matching screenshot */}
              <div className="text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.65', maxWidth: '580px' }}>
                <p className="mb-2 text-white-50">
                  Build your franchise in fast live auctions with private room codes, real-time bidding, and smart purse strategy.
                </p>
                <p className="mb-2 text-white-50">
                  10 franchises. 520+ players. Multiplayer rooms that feel like draft night.
                </p>
                <p className="mb-0 text-white-50">
                  Create a room, challenge friends, chase value picks, and assemble your dream IPL squad in one place.
                </p>
              </div>

              {/* AT A GLANCE Row */}
              <div className="mb-4 pt-2">
                <span
                  className="d-block text-secondary small fw-bold mb-2 text-uppercase"
                  style={{ letterSpacing: '0.12em', fontSize: '0.72rem' }}
                >
                  AT A GLANCE
                </span>
                <div className="d-flex align-items-center gap-4 gap-md-5">
                  <div>
                    <span className="d-block text-white font-display fw-bold fs-2" style={{ lineHeight: '1' }}>
                      10
                    </span>
                    <span className="text-warning small fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      FRANCHISES
                    </span>
                  </div>
                  <div>
                    <span className="d-block text-white font-display fw-bold fs-2" style={{ lineHeight: '1' }}>
                      120CR
                    </span>
                    <span className="text-info small fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      PURSE
                    </span>
                  </div>
                  <div>
                    <span className="d-block text-white font-display fw-bold fs-2" style={{ lineHeight: '1' }}>
                      520+
                    </span>
                    <span className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      PLAYERS
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="d-flex flex-wrap align-items-center gap-3 pt-2">
                <a
                  href="#play-with-friends"
                  className="btn btn-premium-gold px-4 py-3 fw-bold font-display"
                  style={{ fontSize: '1rem', letterSpacing: '0.04em' }}
                >
                  PLAY NOW — FREE
                </a>
                <Link
                  to="/live"
                  className="btn btn-premium-glass px-4 py-3 fw-bold font-display"
                  style={{ fontSize: '1rem' }}
                >
                  LIVE AUCTION ROOMS <i className="bi bi-arrow-right ms-1"></i>
                </Link>
                <a
                  href="#play-with-friends"
                  className="btn btn-outline-secondary text-white px-4 py-3 fw-bold font-display"
                  style={{ fontSize: '1rem' }}
                >
                  JOIN A ROOM <i className="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive 3D Stack of Marquee Player Cards */}
            <div className="col-lg-5 text-center mt-5 mt-lg-0">
              <MarqueeCardStack />
            </div>
          </div>

          {/* LIVE NOW BROADCAST TICKER */}
          <div
            className="broadcast-card text-start p-4 p-md-5 mx-auto mt-5"
            style={{ maxWidth: '980px' }}
          >
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-2">
                <span className="badge-live pulse-live-badge">🔴 LIVE NOW</span>
                <span className="text-white fw-bold font-display" style={{ fontSize: '1.1rem' }}>
                  Marquee Player Auction
                </span>
              </div>
              <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Status: <span className="text-success fw-bold">{activeAuction?.status || 'LIVE'}</span>
              </div>
            </div>

            <div className="row g-4 align-items-center">
              <div className="col-md-4">
                <div className="text-secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  Current Player on Block
                </div>
                <h4 className="text-white font-display fw-bold mb-1">
                  {activeAuction?.currentPlayer?.name || 'Virat Kohli'}
                </h4>
                <div className="text-info" style={{ fontSize: '0.85rem' }}>
                  {activeAuction?.currentPlayer?.role || 'Batter'} • {activeAuction?.currentPlayer?.country || 'India'}
                </div>
              </div>

              <div className="col-md-4 text-md-center">
                <div className="text-secondary" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  Current Leading Bid
                </div>
                <h3 className="text-success font-display fw-bold mb-0">
                  {formatPurse(activeAuction?.currentBid || 20000000)}
                </h3>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Base: {formatPurse(activeAuction?.currentPlayer?.basePrice || 20000000)}
                </div>
              </div>

              <div className="col-md-4 text-md-end">
                <Link to="/live" className="btn btn-premium-gold w-100 w-md-auto px-4 py-2">
                  Enter Live Auction Room <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAY WITH FRIENDS & CREATE ROOMS SECTION */}
      <PlayWithFriendsSection />

      {/* FRANCHISE TRADE DESK SPOTLIGHT BANNER */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, rgba(6, 11, 23, 0.5) 0%, rgba(16, 26, 48, 0.4) 100%)' }}>
        <div className="container-xl">
          <div
            className="glass-card p-4 p-md-5 rounded-4 position-relative overflow-hidden"
            style={{
              border: '1px solid rgba(0, 240, 255, 0.25)',
              background: 'radial-gradient(circle at 80% 50%, rgba(0, 240, 255, 0.1) 0%, rgba(10, 16, 30, 0.95) 70%)'
            }}
          >
            <div className="row g-4 align-items-center justify-content-between">
              <div className="col-lg-8">
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill glass-panel mb-2.5">
                  <i className="bi bi-arrow-left-right text-info"></i>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.08em', color: '#00f0ff' }}>
                    NEW FEATURE: BILATERAL TRADES
                  </span>
                </div>
                <h3 className="text-white font-display fw-bold mb-2 display-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}>
                  FRANCHISE <span style={{ color: 'var(--gold, #fdb913)' }}>TRADE DESK</span> & SQUAD TRANSFERS
                </h3>
                <p className="text-secondary mb-3" style={{ maxWidth: '640px', fontSize: '1rem', lineHeight: '1.5' }}>
                  Swap cricketers between franchises, balance overseas quotas, and balance squad budgets with cash settlements. Check out pending offers or propose your own player trade deal.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/trades" className="btn btn-premium-gold px-4 py-2 font-display fw-bold">
                    Open Trade Desk <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                  <Link to="/teams" className="btn btn-outline-secondary text-white px-4 py-2 font-display">
                    View Team Rosters
                  </Link>
                </div>
              </div>

              <div className="col-lg-4 text-center text-lg-end">
                <div className="d-inline-flex flex-column gap-2 p-3 rounded-4 glass-panel text-start border border-secondary border-opacity-25" style={{ maxWidth: '300px' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-secondary small fw-bold">Recent Trade Deal</span>
                    <span className="badge bg-success text-dark small fw-bold font-display">EXECUTED</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <img src="/players/shubman-gill.jpg" alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                    <i className="bi bi-arrow-left-right text-info"></i>
                    <img src="/players/ayush-mhatre.png" alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                  </div>
                  <div className="text-white small fw-bold">
                    Shubman Gill (GT ➔ CSK)
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    Ayush Mhatre (CSK ➔ GT) + ₹5.0 Cr
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PLAYERS */}
      <section className="py-5">
        <div className="container-xl">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <div>
              <span className="text-info fw-bold font-display" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                MARQUEE POOL
              </span>
              <h2 className="text-white font-display fw-bold mb-0">FEATURED PLAYERS</h2>
            </div>
            <Link to="/players" className="text-info text-decoration-none fw-semibold" style={{ fontSize: '0.9rem' }}>
              View All Players <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {featuredPlayers.map((player) => (
              <div key={player._id} className="col-lg-3 col-md-6">
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TEAMS */}
      <section className="py-5" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container-xl">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <div>
              <span className="text-info fw-bold font-display" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                FRANCHISES
              </span>
              <h2 className="text-white font-display fw-bold mb-0">COMPETING TEAMS</h2>
            </div>
            <Link to="/teams" className="text-info text-decoration-none fw-semibold" style={{ fontSize: '0.9rem' }}>
              View All Teams <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {featuredTeams.map((team) => (
              <div key={team._id} className="col-lg-4 col-md-6">
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5">
        <div className="container-xl text-center">
          <span className="text-info fw-bold font-display" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            STEP-BY-STEP PROCESS
          </span>
          <h2 className="text-white font-display fw-bold mb-5">HOW IT WORKS</h2>

          <div className="row g-4">
            {[
              { step: '01', title: 'Choose Your Team', desc: 'Acquire or manage your franchise with a ₹120 Crore auction purse balance.' },
              { step: '02', title: 'Create Room & Invite', desc: 'Share your private room code with friends or jump straight into the live auction pool.' },
              { step: '03', title: 'Place Real-Time Bids', desc: 'Socket.IO live bidding with anti-sniping protection, countdown timers, and live franchise AI.' },
              { step: '04', title: 'Trade & Swap Stars', desc: 'Use the Franchise Trade Desk to negotiate swaps and balance player quotas.' },
              { step: '05', title: 'Win The Championship', desc: 'Complete your 25-man squad, build the ultimate team, and lift the trophy.' }
            ].map((item, idx) => (
              <div key={idx} className="col-lg col-md-4 col-sm-6">
                <div className="glass-card p-4 h-100 text-start">
                  <div
                    className="font-display fw-bold mb-3"
                    style={{
                      fontSize: '2rem',
                      background: 'linear-gradient(135deg, #00f0ff 0%, #ffb300 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {item.step}
                  </div>
                  <h5 className="text-white font-display fw-bold mb-2">{item.title}</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS MARQUEE SECTION (10 COMMUNITY TESTIMONIALS) */}
      <TestimonialMarquee />

      {/* CTA SECTION */}
      <section className="py-5 my-4">
        <div className="container-xl">
          <div
            className="broadcast-card text-center p-5 position-relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15) 0%, rgba(6, 11, 23, 0.95) 100%)'
            }}
          >
            <h2 className="text-white display-title fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
              READY TO BUILD YOUR DREAM TEAM?
            </h2>
            <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
              Sign up today as a franchise team owner or spectator to take part in the most competitive cricket auction in the world.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <a href="#play-with-friends" className="btn btn-premium-gold px-4 py-2 font-display fw-bold" style={{ fontSize: '1rem' }}>
                Play With Friends
              </a>
              <Link to="/live" className="btn btn-premium-glass px-4 py-2 font-display" style={{ fontSize: '1rem' }}>
                Watch Live Stream
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
