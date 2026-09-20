import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionSocketContext';
import { useAuth } from '../context/AuthContext';
import AuctionPlayerCard from '../components/auction/AuctionPlayerCard';
import CountdownTimer from '../components/auction/CountdownTimer';
import BidControlPanel from '../components/auction/BidControlPanel';
import BidHistoryFeed from '../components/auction/BidHistoryFeed';
import SoldCelebrationOverlay from '../components/auction/SoldCelebrationOverlay';
import RtmModalOverlay from '../components/auction/RtmModalOverlay';
import WarRoomDashboard from '../components/auction/WarRoomDashboard';
import TacticalPitchBoard from '../components/teams/TacticalPitchBoard';
import AiScoutChat from '../components/auction/AiScoutChat';
import TeamLogo from '../components/common/TeamLogo';
import { formatPurse } from '../utils/formatters';
import { useWishlist } from '../context/WishlistContext';
import {
  playHeartbeat,
  playMegaMilestoneHorn,
  playCrowdCheer,
  playTargetAlert
} from '../utils/soundEffects';

const LiveAuction = () => {
  const {
    auction,
    bids,
    remainingSeconds,
    isTimerRunning,
    soldCelebration,
    clearSoldCelebration,
    rtmPrompt,
    resolveRtm,
    voiceActive,
    toggleAuctionVoice,
    placeBid
  } = useAuction();
  const { user, isTeamOwner } = useAuth();
  const { isWishlisted, getWishlistEntry } = useWishlist();

  const [showWarRoom, setShowWarRoom] = useState(false);
  const [showTacticalBoard, setShowTacticalBoard] = useState(false);
  const [showAiScout, setShowAiScout] = useState(false);

  const currentPlayer = auction?.currentPlayer;
  const currentBid = auction?.currentBid || currentPlayer?.basePrice || 0;
  const currentTeam = auction?.currentTeam;

  const isTargetPlayer = Boolean(currentPlayer && isWishlisted(currentPlayer._id));
  const targetEntry = currentPlayer ? getWishlistEntry(currentPlayer._id) : null;

  // Sound: Alert when targeted cricketer comes onto the block
  useEffect(() => {
    if (isTargetPlayer) {
      playTargetAlert();
    }
  }, [currentPlayer?._id, isTargetPlayer]);

  // Sound: Dramatic Heartbeat countdown during final 3 seconds
  useEffect(() => {
    if (isTimerRunning && remainingSeconds <= 3 && remainingSeconds > 0) {
      playHeartbeat();
    }
  }, [remainingSeconds, isTimerRunning]);

  // Sound: Mega Milestone Horn & Crowd cheer when bidding crosses ₹10 Cr / ₹15 Cr
  useEffect(() => {
    if (currentBid >= 100000000 && currentBid <= 110000000) {
      playMegaMilestoneHorn();
      playCrowdCheer();
    } else if (currentBid >= 150000000 && currentBid <= 160000000) {
      playMegaMilestoneHorn();
      playCrowdCheer();
    }
  }, [currentBid]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        {/* TOP STATUS BAR */}
        <div className="glass-card p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-center justify-content-between">
            {/* Title & Status */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge-live pulse-live-badge">🔴 LIVE AUCTION</span>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Round {auction?.currentRound || 1}
                </span>
              </div>
              <h4 className="text-white font-display fw-bold mb-0 text-truncate">
                {auction?.name || 'Premier Cricket Auction 2026'}
              </h4>
            </div>

            {/* Quick Stats Pill */}
            <div className="col-lg-4 col-md-6 text-md-center">
              <div className="d-inline-flex gap-4 p-2 px-3 rounded-pill glass-panel">
                <div>
                  <span className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</span>
                  <div className="text-success fw-bold" style={{ fontSize: '0.9rem' }}>
                    {auction?.status || 'LIVE'}
                  </div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div>
                  <span className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Min Increment</span>
                  <div className="text-info fw-bold" style={{ fontSize: '0.9rem' }}>
                    {formatPurse(auction?.bidIncrement || 2500000)}
                  </div>
                </div>
              </div>
            </div>

            {/* Broadcast Controls & Team Status */}
            <div className="col-lg-4 text-lg-end">
              <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mb-2">
                <button
                  type="button"
                  onClick={toggleAuctionVoice}
                  className={`btn btn-sm ${voiceActive ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  🎙️ Voice: {voiceActive ? 'ON' : 'MUTED'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWarRoom(true)}
                  className="btn btn-sm btn-premium-glass"
                  style={{ fontSize: '0.78rem' }}
                >
                  📊 War Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiScout(!showAiScout)}
                  className={`btn btn-sm ${showAiScout ? 'btn-info' : 'btn-premium-glass'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  🤖 AI Scout
                </button>
                {user?.team && (
                  <button
                    type="button"
                    onClick={() => setShowTacticalBoard(true)}
                    className="btn btn-sm btn-premium-glass"
                    style={{ fontSize: '0.78rem' }}
                  >
                    🏏 Playing XI
                  </button>
                )}
              </div>

              {user ? (
                <div className="d-inline-block text-lg-end">
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    Bidding as: <strong className="text-white">{user.name}</strong>
                  </div>
                  {isTeamOwner && user.team && (
                    <div className="text-success fw-bold font-display" style={{ fontSize: '0.9rem' }}>
                      {user.team.name || 'Your Team'} • Purse: {formatPurse(user.team.remainingPurse)}
                    </div>
                  )}
                </div>
              ) : (
                <span className="badge bg-secondary text-white py-1 px-3" style={{ fontSize: '0.78rem' }}>
                  Spectator Broadcast Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TARGET BOARD PRIORITY BANNER */}
        {isTargetPlayer && (
          <div
            className="p-3 mb-4 d-flex align-items-center justify-content-between text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 140, 0, 0.18) 100%)',
              border: '1px solid #ffd700',
              borderRadius: '16px',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.35)'
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 215, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}
              >
                🎯
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <strong className="text-warning font-display fs-6">
                    PRIORITY TARGET ON THE BLOCK!
                  </strong>
                  <span className="badge bg-warning text-dark fw-bold">ON YOUR TARGET LIST</span>
                </div>
                <div className="text-white-50 small">
                  {currentPlayer?.name} is on your Target Board • Your planned maximum budget is{' '}
                  <strong className="text-white">
                    {formatPurse(targetEntry?.targetBudget || currentPlayer?.basePrice * 2)}
                  </strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWarRoom(true)}
              className="btn btn-outline-warning btn-sm fw-bold d-none d-md-inline-flex"
            >
              Check Purse & Quota
            </button>
          </div>
        )}

        {/* MAIN BROADCAST SECTION */}
        <div className="row g-4 mb-4">
          {/* LEFT: Current Player Centerpiece (col-lg-5) */}
          <div className="col-lg-5">
            <AuctionPlayerCard player={currentPlayer} />
          </div>

          {/* CENTER: Current Bid & Countdown (col-lg-4) */}
          <div className="col-lg-4">
            <div
              className="broadcast-card h-100 p-4 d-flex flex-column justify-content-between text-center"
              style={{ minHeight: '380px' }}
            >
              {/* Top Banner */}
              <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                CURRENT LEADING BID
              </div>

              {/* Huge Bid Value */}
              <div className="my-3">
                <div
                  className="font-display fw-bold"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                    color: '#00f0ff',
                    textShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
                    lineHeight: 1
                  }}
                >
                  {formatPurse(currentBid)}
                </div>

                {/* Leading Team Display */}
                <div className="mt-3">
                  <span className="text-secondary d-block mb-1" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    Leading Franchise
                  </span>

                  {currentTeam ? (
                    <div
                      className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: `1px solid ${currentTeam.primaryColor || '#00f0ff'}`
                      }}
                    >
                      <TeamLogo team={currentTeam} size={26} />
                      <span className="text-white fw-bold font-display" style={{ fontSize: '1.05rem' }}>
                        {currentTeam.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                      No bids placed yet • Base: {formatPurse(currentPlayer?.basePrice || 0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Authoritative Countdown Timer */}
              <div className="pt-3 border-top border-secondary border-opacity-25">
                <CountdownTimer
                  seconds={remainingSeconds}
                  isRunning={isTimerRunning}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Bidding Feed / Teams (col-lg-3) */}
          <div className="col-lg-3">
            <BidHistoryFeed bids={bids} />
          </div>
        </div>

        {/* BOTTOM: Bidding Control Console */}
        <div className="row g-4">
          <div className="col-12">
            <BidControlPanel
              auction={auction}
              onPlaceBid={placeBid}
              remainingSeconds={remainingSeconds}
              isTimerRunning={isTimerRunning}
            />
          </div>
        </div>
      </div>

      {/* SOLD CELEBRATION MODAL */}
      <SoldCelebrationOverlay
        celebration={soldCelebration}
        onClose={clearSoldCelebration}
      />

      {/* IPL RIGHT TO MATCH (RTM) OVERLAY */}
      {rtmPrompt && (
        <RtmModalOverlay
          rtmPrompt={rtmPrompt}
          userTeam={user?.team}
          onDecision={resolveRtm}
        />
      )}

      {/* FRANCHISE WAR ROOM STRATEGY RADAR */}
      {showWarRoom && (
        <WarRoomDashboard onClose={() => setShowWarRoom(false)} />
      )}

      {/* AI FRANCHISE SCOUT FLOATING CHAT DRAWER */}
      {showAiScout && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 9995,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <AiScoutChat
            currentLot={currentPlayer}
            userTeam={user?.team}
            onClose={() => setShowAiScout(false)}
          />
        </div>
      )}

      {/* TEAM TACTICAL PLAYING XI BOARD MODAL */}
      {showTacticalBoard && user?.team && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 24, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 9992,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div style={{ maxWidth: '1050px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-end mb-2">
              <button
                type="button"
                onClick={() => setShowTacticalBoard(false)}
                className="btn btn-sm btn-outline-secondary rounded-circle"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>
            <TacticalPitchBoard
              team={user.team}
              isOwner={isTeamOwner}
              onTeamUpdated={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAuction;
