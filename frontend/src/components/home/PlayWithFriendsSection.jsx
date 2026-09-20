import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import { teamService } from '../../services/teamService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const generateRandomCode = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `IPL-${digits}`;
};

const PlayWithFriendsSection = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Modal State
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join' | 'lobbies'

  // Create Room State
  const [roomName, setRoomName] = useState('Cricket Draft Night');
  const [roomCode, setRoomCode] = useState(generateRandomCode());
  const [hostName, setHostName] = useState(user?.name || 'Franchise Owner');
  const [hostTeamId, setHostTeamId] = useState('');
  const [initialPurse, setInitialPurse] = useState(1200000000);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [isPrivate, setIsPrivate] = useState(true);
  const [creating, setCreating] = useState(false);

  // Join Room State
  const [inputCode, setInputCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Teams & Public Rooms
  const [teams, setTeams] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);

  useEffect(() => {
    if (user?.name) {
      setHostName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [teamsData, roomsData] = await Promise.all([
          teamService.getTeams(),
          roomService.getPublicRooms().catch(() => [])
        ]);
        if (teamsData) {
          setTeams(teamsData);
          if (teamsData.length > 0 && !hostTeamId) {
            setHostTeamId(teamsData[0]._id);
          }
        }
        if (roomsData) setPublicRooms(roomsData);
      } catch (err) {
        console.error('Error fetching room setup data:', err);
      }
    };
    loadInitialData();
  }, []);

  const handleRegenerateCode = (e) => {
    e.preventDefault();
    setRoomCode(generateRandomCode());
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      addToast('Please enter a room name', 'warning');
      return;
    }

    setCreating(true);
    try {
      const res = await roomService.createRoom({
        name: roomName,
        roomCode,
        hostName,
        hostTeamId: hostTeamId || null,
        initialPurse: Number(initialPurse),
        timerSeconds: Number(timerSeconds),
        isPrivate
      });

      addToast(`Room ${res.data.roomCode} created! Entering lobby...`, 'success');
      setShowMultiplayerModal(false);
      navigate(`/room/${res.data.roomCode}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create room', 'danger');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinWithCode = (e) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      addToast('Please enter a valid room code', 'warning');
      return;
    }
    setJoining(true);
    setShowMultiplayerModal(false);
    navigate(`/room/${code}`);
  };

  return (
    <section id="play-with-friends" className="py-5 position-relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(6, 11, 23, 0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: '5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(6, 11, 23, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container-xl position-relative" style={{ zIndex: 2 }}>
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2
            className="font-display fw-bold display-title mb-2"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', letterSpacing: '-0.02em' }}
          >
            <span style={{ color: '#ffffff' }}>IPL MOCK </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              AUCTION
            </span>
          </h2>
          <p
            className="text-secondary mx-auto mb-0"
            style={{ maxWidth: '680px', fontSize: '1.05rem', lineHeight: '1.6' }}
          >
            Experience the thrill of IPL auctions with realistic AI bidding and multiple game modes
          </p>
        </div>

        {/* 2-Card Game Modes Layout (Exact match of requested design) */}
        <div className="row g-4 align-items-stretch justify-content-center">
          {/* CARD 1: MEGA AUCTION (SINGLE PLAYER) */}
          <div className="col-lg-6">
            <div
              className="p-4 p-md-5 h-100 d-flex flex-column justify-content-between position-relative rounded-4"
              style={{
                background: 'linear-gradient(170deg, rgba(20, 16, 36, 0.92) 0%, rgba(10, 8, 20, 0.97) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: '0 16px 40px -10px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <div>
                {/* Header: Icon, Titles, Badge */}
                <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    {/* Shield Icon Box */}
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'rgba(168, 85, 247, 0.14)',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-white font-display fw-bold mb-0" style={{ fontSize: '1.55rem', letterSpacing: '-0.01em' }}>
                        MEGA AUCTION
                      </h3>
                      <div
                        className="fw-bold font-display"
                        style={{ fontSize: '0.78rem', letterSpacing: '0.07em', color: '#d946ef' }}
                      >
                        IPL 2025 FORMAT (SINGLE PLAYER)
                      </div>
                    </div>
                  </div>

                  <span
                    className="badge rounded-pill font-display fw-bold"
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(234, 179, 8, 0.35)',
                      fontSize: '0.75rem',
                      padding: '6px 14px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    FULL SIMULATION
                  </span>
                </div>

                {/* Description */}
                <p className="text-light mb-4" style={{ fontSize: '0.96rem', lineHeight: '1.5', opacity: 0.9 }}>
                  Experience the ultimate high-stakes IPL draft simulation with deep strategic features:
                </p>

                {/* Features Checklist with green checkmarks */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {[
                    'Intelligent AI Bidding to simulate other teams',
                    'RTM Cards available',
                    'Choose your own retentions',
                    'Skip players and sets'
                  ].map((feature, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2.5">
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1.5px solid #10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <i className="bi bi-check-lg" style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold' }}></i>
                      </div>
                      <span style={{ color: '#cbd5e1', fontSize: '0.94rem' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => navigate('/live')}
                className="btn w-100 py-3 font-display fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                  color: '#ffffff',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  letterSpacing: '0.04em',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <span>🏆</span>
                <span>PLAY NOW &gt;</span>
              </button>
            </div>
          </div>

          {/* CARD 2: MULTIPLAYER (PLAY LIVE WITH FRIENDS) */}
          <div className="col-lg-6">
            <div
              className="p-4 p-md-5 h-100 d-flex flex-column justify-content-between position-relative rounded-4"
              style={{
                background: 'linear-gradient(170deg, rgba(10, 22, 40, 0.92) 0%, rgba(6, 14, 26, 0.97) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 16px 40px -10px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <div>
                {/* Header: Icon, Titles, Badge */}
                <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    {/* Multiplayer Icon Box */}
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'rgba(56, 189, 248, 0.14)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-white font-display fw-bold mb-0" style={{ fontSize: '1.55rem', letterSpacing: '-0.01em' }}>
                        MULTIPLAYER
                      </h3>
                      <div
                        className="fw-bold font-display"
                        style={{ fontSize: '0.78rem', letterSpacing: '0.07em', color: '#38bdf8' }}
                      >
                        PLAY LIVE WITH FRIENDS
                      </div>
                    </div>
                  </div>

                  <span
                    className="badge rounded-pill font-display fw-bold d-flex align-items-center gap-1.5"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      fontSize: '0.75rem',
                      padding: '6px 14px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem' }}>●</span> LIVE
                  </span>
                </div>

                {/* Description */}
                <p className="text-light mb-4" style={{ fontSize: '0.96rem', lineHeight: '1.5', opacity: 0.9 }}>
                  Create rooms, invite friends, and battle in real-time online auctions:
                </p>

                {/* Features Checklist with blue checkmarks */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {[
                    'Real-time live bidding synchronized across players',
                    'Host public or private rooms with custom room codes',
                    'Live room chat, team assignment & spectator mode',
                    'Retention phase & RTM match triggers'
                  ].map((feature, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2.5">
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1.5px solid #0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <i className="bi bi-check-lg" style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 'bold' }}></i>
                      </div>
                      <span style={{ color: '#cbd5e1', fontSize: '0.94rem' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowMultiplayerModal(true)}
                className="btn w-100 py-3 font-display fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  letterSpacing: '0.04em',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <span>👥</span>
                <span>ENTER MULTIPLAYER &gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MULTIPLAYER ACTION MODAL (Smooth pop-up when user clicks "ENTER MULTIPLAYER >") */}
      {showMultiplayerModal && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1060,
            padding: '1.5rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMultiplayerModal(false);
          }}
        >
          <div
            className="glass-card p-4 p-md-5 rounded-4 position-relative w-100 my-auto"
            style={{
              maxWidth: '780px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'linear-gradient(165deg, rgba(14, 22, 40, 0.96) 0%, rgba(6, 11, 23, 0.98) 100%)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(14, 165, 233, 0.15)'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowMultiplayerModal(false)}
              className="btn-close btn-close-white position-absolute"
              style={{ top: '24px', right: '24px', opacity: 0.8 }}
              aria-label="Close"
            />

            {/* Modal Title & Navigation Tabs */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill glass-panel mb-2">
                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.08em', color: '#00f0ff' }}>
                  ONLINE MULTIPLAYER ARENA
                </span>
              </div>
              <h3 className="text-white font-display fw-bold mb-3">MULTIPLAYER DRAFT ROOMS</h3>

              {/* Tabs */}
              <div className="d-flex justify-content-center gap-2 p-1 rounded-pill glass-panel mx-auto" style={{ maxWidth: '460px' }}>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill font-display px-3 py-1.5 ${
                    activeTab === 'create' ? 'btn-premium-gold text-dark fw-bold' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('create')}
                >
                  <i className="bi bi-plus-circle me-1"></i> Create Room
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill font-display px-3 py-1.5 ${
                    activeTab === 'join' ? 'btn-premium-accent text-dark fw-bold' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('join')}
                >
                  <i className="bi bi-key me-1"></i> Join with Code
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill font-display px-3 py-1.5 ${
                    activeTab === 'lobbies' ? 'btn-info text-dark fw-bold' : 'text-secondary'
                  }`}
                  onClick={() => setActiveTab('lobbies')}
                >
                  <i className="bi bi-broadcast me-1"></i> Public Lobbies ({publicRooms.length})
                </button>
              </div>
            </div>

            {/* TAB 1: CREATE ROOM */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateRoom}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">ROOM NAME</label>
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g. Champions League Draft"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold d-flex justify-content-between">
                      <span>ROOM CODE</span>
                      <a href="#regen" onClick={handleRegenerateCode} className="text-info text-decoration-none" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-arrow-clockwise"></i> Regenerate
                      </a>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-dark text-warning fw-bold font-display"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        style={{ letterSpacing: '0.08em' }}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(roomCode);
                          addToast(`Room code ${roomCode} copied to clipboard!`, 'info');
                        }}
                        title="Copy Room Code"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">YOUR NAME (HOST)</label>
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">CLAIM YOUR FRANCHISE</label>
                    <select
                      className="form-select form-control-dark"
                      value={hostTeamId}
                      onChange={(e) => setHostTeamId(e.target.value)}
                    >
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.shortName} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">STARTING PURSE PER TEAM</label>
                    <select
                      className="form-select form-control-dark"
                      value={initialPurse}
                      onChange={(e) => setInitialPurse(Number(e.target.value))}
                    >
                      <option value={1200000000}>₹120 Crore (Official IPL 2026)</option>
                      <option value={1000000000}>₹100 Crore (Standard)</option>
                      <option value={800000000}>₹80 Crore (Budget Challenge)</option>
                      <option value={1500000000}>₹150 Crore (Galactico Mega)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-bold">BID TIMER PER CALL</label>
                    <select
                      className="form-select form-control-dark"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Number(e.target.value))}
                    >
                      <option value={10}>10 Seconds (Fast Blitz)</option>
                      <option value={15}>15 Seconds (Standard Pro)</option>
                      <option value={20}>20 Seconds (Casual)</option>
                      <option value={30}>30 Seconds (Strategic)</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="modalPrivateRoomSwitch"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                      />
                      <label className="form-check-label text-secondary small" htmlFor="modalPrivateRoomSwitch">
                        <strong className="text-white">Private Room:</strong> Only friends with the exact Room Code can join.
                      </label>
                    </div>
                  </div>

                  <div className="col-12 mt-3">
                    <button
                      type="submit"
                      className="btn btn-premium-gold w-100 py-3 font-display fw-bold"
                      style={{ fontSize: '1.05rem', letterSpacing: '0.04em' }}
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          CREATING WAR ROOM...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-broadcast me-2"></i>
                          CREATE ROOM & LAUNCH LOBBY
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: JOIN WITH CODE */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinWithCode} className="py-3">
                <div className="text-center mb-4">
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00f0ff',
                      fontSize: '1.8rem',
                      margin: '0 auto 12px'
                    }}
                  >
                    <i className="bi bi-key-fill"></i>
                  </div>
                  <h5 className="text-white font-display fw-bold mb-1">ENTER ROOM CODE</h5>
                  <p className="text-secondary small mb-0">Ask your room host for their 8-character invite code</p>
                </div>

                <div className="input-group mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  <input
                    type="text"
                    className="form-control form-control-dark font-display text-uppercase text-center py-3"
                    placeholder="e.g. IPL-7821"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    style={{ letterSpacing: '0.1em', fontSize: '1.2rem', fontWeight: 'bold' }}
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn btn-premium-accent px-4 font-display fw-bold"
                    disabled={joining}
                  >
                    JOIN ROOM <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: PUBLIC LOBBIES */}
            {activeTab === 'lobbies' && (
              <div className="py-2">
                {publicRooms.length > 0 ? (
                  <div className="d-flex flex-column gap-2.5">
                    {publicRooms.map((r) => (
                      <div
                        key={r._id}
                        className="p-3 rounded glass-panel d-flex align-items-center justify-content-between"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        <div>
                          <strong className="text-white font-display d-block" style={{ fontSize: '0.98rem' }}>
                            {r.name}
                          </strong>
                          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                            Host: {r.hostName} • Code: <strong className="text-warning">{r.roomCode}</strong>
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowMultiplayerModal(false);
                            navigate(`/room/${r.roomCode}`);
                          }}
                          className="btn btn-sm btn-outline-info px-4 py-1.5 font-display fw-bold"
                        >
                          Join Lobby
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-broadcast text-secondary mb-2 d-block" style={{ fontSize: '2.5rem' }}></i>
                    <h6 className="text-white font-display">No Public Lobbies Active Right Now</h6>
                    <p className="text-secondary small mb-3">Create your own private room and invite your friends!</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-premium-gold px-3 font-display fw-bold"
                      onClick={() => setActiveTab('create')}
                    >
                      Create Room Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlayWithFriendsSection;
