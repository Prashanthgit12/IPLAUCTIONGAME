import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { useToast } from './ToastContext';
import { playBidSound, playCelebrationSound, playGavelSound, playTickSound } from '../utils/soundEffects';
import { auctionService } from '../services/auctionService';
import auctioneerVoice, { isVoiceEnabled, toggleVoice } from '../utils/auctioneerVoice';

const AuctionSocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AuctionSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [remainingSeconds, setRemainingSeconds] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soldCelebration, setSoldCelebration] = useState(null);
  const [rtmPrompt, setRtmPrompt] = useState(null);
  const [voiceActive, setVoiceActive] = useState(true);
  const { addToast } = useToast();

  const toggleAuctionVoice = useCallback(() => {
    const newState = toggleVoice();
    setVoiceActive(newState);
    addToast(`Auctioneer voice commentary ${newState ? 'ENABLED' : 'MUTED'}`, 'info');
    return newState;
  }, [addToast]);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      socketInstance.emit('auction:join');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    // Full snapshot sync
    socketInstance.on('auction:sync', (data) => {
      if (data.auction) setAuction(data.auction);
      if (data.bids) setBids(data.bids);
      if (data.remainingSeconds !== undefined) setRemainingSeconds(data.remainingSeconds);
      if (data.isTimerRunning !== undefined) setIsTimerRunning(data.isTimerRunning);
    });

    // Authoritative Timer updates
    socketInstance.on('auction:timer-update', (data) => {
      setRemainingSeconds(data.remainingSeconds);
      setIsTimerRunning(data.isTimerRunning);

      // Play tick sound on critical countdown
      if (data.remainingSeconds <= 5 && data.remainingSeconds > 0 && data.isTimerRunning) {
        playTickSound();
      }

      // Voice commentary at countdown warnings (10s and 5s)
      if (data.isTimerRunning && (data.remainingSeconds === 10 || data.remainingSeconds === 5)) {
        auctioneerVoice.announceWarning(data.remainingSeconds, auction?.currentBid, auction?.currentTeam?.name);
      }
    });

    // New Bid broadcast
    socketInstance.on('auction:new-bid', (data) => {
      setAuction(data.auction);
      setBids((prev) => [data.bid, ...prev]);
      if (data.remainingSeconds !== undefined) {
        setRemainingSeconds(data.remainingSeconds);
      }
      playBidSound();
      auctioneerVoice.announceBid(data.bid.team.name, data.bid.amount);
      addToast(`New bid: ₹${(data.bid.amount / 10000000).toFixed(2)} Cr by ${data.bid.team.name}`, 'info');
    });

    // Player SOLD broadcast
    socketInstance.on('auction:player-sold', (data) => {
      setRtmPrompt(null);
      setSoldCelebration(data);
      playCelebrationSound();
      auctioneerVoice.announceSold(data.player.name, data.team.name, data.soldPrice);

      // Trigger high-energy confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ffd700', '#00e676', '#ff1744']
        });
      } catch (err) {
        // Confetti canvas fallback
      }

      addToast(`SOLD! ${data.player.name} bought by ${data.team.name} for ₹${(data.soldPrice / 10000000).toFixed(2)} Cr!`, 'gold', 5000);
    });

    // Player UNSOLD broadcast
    socketInstance.on('auction:player-unsold', (data) => {
      setRtmPrompt(null);
      playGavelSound();
      auctioneerVoice.announceUnsold(data.player.name);
      addToast(`${data.player.name} remains UNSOLD`, 'warning');
      setAuction((prev) => (prev ? { ...prev, currentPlayer: { ...data.player, status: 'UNSOLD' } } : prev));
    });

    // Next Player broadcast
    socketInstance.on('auction:next-player', (data) => {
      setRtmPrompt(null);
      setSoldCelebration(null);
      setAuction(data.auction);
      setBids([]);
      setRemainingSeconds(data.auction?.rules?.timerSeconds || 15);
      auctioneerVoice.announcePlayer(data.player);
      addToast(`Now on block: ${data.player.name} (Base Price: ₹${(data.player.basePrice / 10000000).toFixed(2)} Cr)`, 'info');
    });

    // Official IPL Right to Match (RTM) Prompt
    socketInstance.on('auction:rtm-prompt', (data) => {
      setRtmPrompt(data);
      auctioneerVoice.announceRTM(data.rtmTeam.name, data.player.name, data.winningBid);
    });

    socketInstance.on('auction:rtm-resolved', (data) => {
      setRtmPrompt(null);
      addToast(data.message, data.matched ? 'gold' : 'info');
    });

    // Status changes
    socketInstance.on('auction:started', (data) => {
      setAuction(data.auction);
      addToast('Auction is now LIVE!', 'success');
    });

    socketInstance.on('auction:paused', (data) => {
      setAuction(data.auction);
      setIsTimerRunning(false);
      addToast('Auction has been PAUSED by Administrator', 'warning');
    });

    socketInstance.on('auction:resumed', (data) => {
      setAuction(data.auction);
      setIsTimerRunning(true);
      addToast('Auction RESUMED!', 'success');
    });

    socketInstance.on('auction:ended', (data) => {
      setIsTimerRunning(false);
      addToast(data.message || 'Auction has officially ENDED', 'info');
    });

    socketInstance.on('auction:error', (data) => {
      addToast(data.message, 'danger');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('auction:leave');
      socketInstance.disconnect();
    };
  }, [addToast]);

  // Place bid via socket or REST fallback
  const placeBid = useCallback(
    async (teamId, amount) => {
      const token = sessionStorage.getItem('auctionx_token');
      if (!auction) {
        addToast('Auction not loaded yet', 'danger');
        return;
      }
      if (!token) {
        addToast('Please login as a Team Owner to bid', 'warning');
        return;
      }

      if (socket && socket.connected) {
        socket.emit('auction:bid', {
          token,
          auctionId: auction._id,
          teamId,
          amount
        });
      } else {
        try {
          const res = await auctionService.placeBid(auction._id, { teamId, amount });
          if (res?.auction) {
            setAuction(res.auction);
            if (res.bid) setBids((prev) => [res.bid, ...prev]);
            addToast(`Bid placed: ₹${(amount / 10000000).toFixed(2)} Cr!`, 'info');
          }
        } catch (err) {
          const msg = err?.response?.data?.message || err.message;
          addToast(msg, 'danger');
        }
      }
    },
    [socket, auction, addToast]
  );

  const clearSoldCelebration = useCallback(() => {
    setSoldCelebration(null);
  }, []);

  const resolveRtm = useCallback(
    (matched) => {
      if (socket && socket.connected && auction) {
        socket.emit('auction:rtm-decision', {
          auctionId: auction._id,
          matched
        });
      }
      setRtmPrompt(null);
    },
    [socket, auction]
  );

  return (
    <AuctionSocketContext.Provider
      value={{
        socket,
        connected,
        auction,
        setAuction,
        bids,
        setBids,
        remainingSeconds,
        isTimerRunning,
        soldCelebration,
        clearSoldCelebration,
        rtmPrompt,
        resolveRtm,
        voiceActive,
        toggleAuctionVoice,
        placeBid
      }}
    >
      {children}
    </AuctionSocketContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionSocketContext);
