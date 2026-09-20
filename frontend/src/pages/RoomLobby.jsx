import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { teamService } from '../services/teamService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { formatCrore } from '../utils/formatters';

const RoomLobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [starting, setStarting] = useState(false);

  // Participant Identity
  const [userName, setUserName] = useState(user?.name || localStorage.getItem('ipl_lobby_username') || '');
  const [namePromptOpen, setNamePromptOpen] = useState(!user && !localStorage.getItem('ipl_lobby_username'));

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef(null);

  // Fetch Room & Teams
  const fetchRoomData = async () => {
    try {
      const [roomData, teamsData] = await Promise.all([
        roomService.getRoom(roomCode),
        teamService.getTeams()
      ]);
      setRoom(roomData);
      setAllTeams(teamsData || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load auction room', 'danger');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomCode]);

  // Socket Connection for Room
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('room:join', {
      roomCode,
      userName: userName || 'Cricket Fan'
    });

    socket.on('room:sync', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('room:started', () => {
      addToast('The host has started the draft auction! Entering war room...', 'success');
      setTimeout(() => {
        navigate('/live');
      }, 1200);
    });

    socket.on('room:notification', (notif) => {
      setChatMessages((prev) => [
        ...prev,
        { isSystem: true, text: notif.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    });

    socket.on('room:new-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('room:leave', { roomCode, userName });
      socket.disconnect();
    };
  }, [roomCode, userName]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    localStorage.setItem('ipl_lobby_username', userName.trim());
    setNamePromptOpen(false);
    addToast(`Welcome to the room, ${userName}!`, 'success');
  };

  const handleClaimTeam = async (teamId) => {
    const currentName = userName.trim() || 'Anonymous Manager';
    setClaiming(true);
    try {
      const res = await roomService.claimTeam(roomCode, {
        name: currentName,
        teamId
      });
      setRoom(res.data);
      if (socketRef.current) {
        socketRef.current.emit('room:update', { roomCode, roomData: res.data });
      }
      addToast('Franchise claimed successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to claim franchise', 'warning');
    } finally {
      setClaiming(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;

    socketRef.current.emit('room:message', {
      roomCode,
      userName: userName || 'Manager',
      message: chatInput.trim()
    });
    setChatInput('');
  };

  const handleStartAuction = async () => {
    setStarting(true);
    try {
      await roomService.startAuction(roomCode);
      if (socketRef.current) {
        socketRef.current.emit('room:start', { roomCode });
      }
      addToast('Draft officially started! Launching live auction...', 'success');
      navigate('/live');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to start auction', 'danger');
    } finally {
      setStarting(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast('Room invite link copied to clipboard!', 'info');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode.toUpperCase());
    addToast(`Room code ${roomCode.toUpperCase()} copied!`, 'info');
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', paddingTop: '100px' }}>
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h4 className="text-white font-display">CONNECTING TO WAR ROOM {roomCode}...</h4>
        </div>
      </div>
    );
  }

  const isHost = room && (
    (user && (room.hostName === user.name || room.hostName === user.email)) ||
    (userName && room.hostName.toLowerCase() === userName.toLowerCase()) ||
    room.members.find((m) => m.name.toLowerCase() === userName.toLowerCase() && m.role === 'HOST')
  );

  const myClaimedTeam = room?.members?.find((m) => m.name.toLowerCase() === userName.toLowerCase())?.team;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '70px' }}>
      <div className="container-xl">
        {/* ROOM TOP HEADER */}
        <div className="glass-card p-4 p-md-5 mb-4 position-relative overflow-hidden">
          <div className="row g-4 align-items-center justify-content-between">
            {/* Left Info */}
            <div className="col-lg-7">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-warning text-dark font-display fw-bold px-3 py-1.5" style={{ fontSize: '0.8rem' }}>
                  MULTIPLAYER LOBBY
                </span>
                <span className="badge bg-secondary font-display text-white" style={{ fontSize: '0.8rem' }}>
                  STATUS: {room?.status || 'LOBBY'}
                </span>
                {isHost && (
                  <span className="badge bg-danger text-white font-display" style={{ fontSize: '0.8rem' }}>
                    YOU ARE HOST
                  </span>
                )}
              </div>

              <h2 className="text-white font-display fw-bold mb-2 display-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                {room?.name || 'IPL Draft Lobby'}
              </h2>

              <p className="text-secondary mb-3" style={{ fontSize: '0.95rem' }}>
                Host: <strong className="text-white">{room?.hostName}</strong> • Share the room code below with friends to claim franchises and start bidding.
              </p>

              {/* Room Code Badge with Copy Actions */}
              <div className="d-inline-flex flex-wrap align-items-center gap-2 p-2 px-3 rounded-4 glass-panel border border-warning border-opacity-50">
                <span className="text-secondary small fw-bold">ROOM CODE:</span>
                <span className="text-warning font-display fw-bold fs-4 px-2" style={{ letterSpacing: '0.08em' }}>
                  {room?.roomCode}
                </span>
                <button onClick={handleCopyCode} className="btn btn-sm btn-outline-warning px-2.5 py-1" title="Copy Code">
                  <i className="bi bi-clipboard me-1"></i> Copy Code
                </button>
                <button onClick={handleCopyLink} className="btn btn-sm btn-premium-glass px-2.5 py-1 text-info" title="Copy Shareable Link">
                  <i className="bi bi-link-45deg me-1"></i> Copy Link
                </button>
              </div>
            </div>

            {/* Right Action & Rules summary */}
            <div className="col-lg-5 text-lg-end">
              <div className="d-inline-flex flex-column gap-3 w-100 w-lg-auto" style={{ maxWidth: '380px' }}>
                <div className="p-3 rounded glass-card text-start">
                  <div className="text-secondary small fw-bold mb-2 text-uppercase">Room Settings</div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary small">Starting Purse:</span>
                    <strong className="text-success">{formatCrore(room?.rules?.initialPurse || 1200000000)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary small">Bid Timer:</span>
                    <strong className="text-info">{room?.rules?.timerSeconds || 15} Seconds</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary small">Franchises Claimed:</span>
                    <strong className="text-warning">
                      {room?.members?.filter((m) => m.team).length || 0} / 10
                    </strong>
                  </div>
                </div>

                {/* Host Start Button or Participant Waiting */}
                {isHost ? (
                  <button
                    onClick={handleStartAuction}
                    className="btn btn-premium-gold w-100 py-3 font-display fw-bold"
                    style={{ fontSize: '1.1rem' }}
                    disabled={starting}
                  >
                    {starting ? 'LAUNCHING LIVE DRAFT...' : '🚀 START LIVE DRAFT NOW'}
                  </button>
                ) : (
                  <div className="p-3 rounded glass-panel text-center">
                    <span className="pulse-live-badge d-inline-block me-2" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff' }}></span>
                    <span className="text-white-50 small fw-bold">Waiting for host ({room?.hostName}) to start draft...</span>
                  </div>
                )}

                <Link to="/live" className="btn btn-outline-secondary text-white btn-sm">
                  Jump to Live Auction Directly <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FRANCHISE SELECTION GRID & LOBBY BANTER */}
        <div className="row g-4">
          {/* 10 Franchise Claim Slots (col-lg-8) */}
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h4 className="text-white font-display fw-bold mb-0">FRANCHISE SLOTS (10 TEAMS)</h4>
                <span className="text-secondary small">Pick an unclaimed franchise to represent in this draft</span>
              </div>
              {myClaimedTeam && (
                <span className="badge bg-success font-display px-3 py-1.5">
                  <i className="bi bi-shield-check me-1"></i> You are {allTeams.find((t) => t._id === (myClaimedTeam._id || myClaimedTeam))?.shortName}
                </span>
              )}
            </div>

            <div className="row g-3">
              {allTeams.map((team) => {
                const claimedMember = room?.members?.find(
                  (m) => m.team && (m.team._id || m.team).toString() === team._id.toString()
                );
                const isClaimedByMe = claimedMember && claimedMember.name.toLowerCase() === userName.toLowerCase();

                return (
                  <div key={team._id} className="col-md-6">
                    <div
                      className="glass-card p-3 rounded-4 h-100 d-flex flex-column justify-content-between"
                      style={{
                        borderLeft: `5px solid ${team.primaryColor || '#00f0ff'}`,
                        background: isClaimedByMe ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={team.logo}
                            alt={team.name}
                            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                          />
                          <div>
                            <h6 className="text-white font-display fw-bold mb-0">{team.name}</h6>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                              Purse: {formatCrore(room?.rules?.initialPurse || team.initialPurse)}
                            </span>
                          </div>
                        </div>

                        <span
                          className="badge font-display"
                          style={{
                            backgroundColor: claimedMember ? (isClaimedByMe ? '#00e676' : '#334155') : 'rgba(253, 185, 19, 0.2)',
                            color: claimedMember ? (isClaimedByMe ? '#000' : '#cbd5e1') : '#fdb913'
                          }}
                        >
                          {claimedMember ? (isClaimedByMe ? 'YOU' : 'TAKEN') : 'FREE'}
                        </span>
                      </div>

                      {claimedMember ? (
                        <div className="p-2 rounded glass-panel d-flex align-items-center justify-content-between">
                          <span className="text-secondary small">
                            Claimed by: <strong className="text-white">{claimedMember.name}</strong>
                          </span>
                          {claimedMember.role === 'HOST' && (
                            <span className="badge bg-warning text-dark font-display" style={{ fontSize: '0.65rem' }}>
                              HOST
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimTeam(team._id)}
                          className="btn btn-sm btn-outline-warning w-100 font-display fw-bold"
                          disabled={claiming}
                        >
                          <i className="bi bi-hand-index-thumb me-1"></i> CLAIM THIS FRANCHISE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lobby Banter Chat & Participant List (col-lg-4) */}
          <div className="col-lg-4">
            <div className="glass-card p-4 h-100 d-flex flex-column" style={{ minHeight: '520px' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-chat-dots-fill text-info"></i>
                  <h6 className="text-white font-display fw-bold mb-0">WAR ROOM BANTER</h6>
                </div>
                <span className="badge bg-secondary small">{room?.members?.length || 1} Present</span>
              </div>

              {/* Chat Feed */}
              <div
                className="flex-grow-1 overflow-auto d-flex flex-column gap-2 mb-3 pe-1"
                style={{ maxHeight: '380px' }}
              >
                <div className="p-2 rounded glass-panel text-center small text-secondary">
                  Welcome to room <strong>{roomCode}</strong>! Send banter or invite your friends.
                </div>

                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="small">
                    {msg.isSystem ? (
                      <div className="text-muted text-center fst-italic" style={{ fontSize: '0.75rem' }}>
                        {msg.text}
                      </div>
                    ) : (
                      <div
                        className="p-2 rounded"
                        style={{
                          background: msg.sender === userName ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                          alignSelf: msg.sender === userName ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div className="d-flex justify-content-between gap-2 mb-0.5">
                          <strong className="text-warning" style={{ fontSize: '0.75rem' }}>{msg.sender}</strong>
                          <span className="text-muted" style={{ fontSize: '0.65rem' }}>{msg.timestamp}</span>
                        </div>
                        <div className="text-white" style={{ fontSize: '0.82rem', wordBreak: 'break-word' }}>
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    placeholder="Type draft banter..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-premium-accent px-3">
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Set Name Modal Prompt if visitor has no name */}
      {namePromptOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card p-4 border border-warning" style={{ background: '#0b1329' }}>
              <h4 className="text-white font-display fw-bold mb-2">ENTER WAR ROOM</h4>
              <p className="text-secondary small mb-3">Please enter your display name to join the room and claim a franchise:</p>
              <form onSubmit={handleSaveName}>
                <input
                  type="text"
                  className="form-control form-control-dark mb-3"
                  placeholder="Your Name (e.g. CricketFan_07)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-premium-gold w-100 py-2 font-display fw-bold">
                  CONFIRM & ENTER LOBBY
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomLobby;
