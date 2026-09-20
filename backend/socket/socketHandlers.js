const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Bid = require('../models/Bid');
const auctionEngine = require('../services/auctionEngine');

module.exports = (io) => {
  auctionEngine.setIO(io);

  io.on('connection', (socket) => {
    // console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join auction room
    socket.on('auction:join', async (data) => {
      socket.join('auction_room');

      try {
        const auction = await auctionEngine.getOrCreateActiveAuction();
        let bids = [];
        if (auction && auction.currentPlayer) {
          bids = await Bid.find({ player: auction.currentPlayer._id })
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('team', 'name shortName logo primaryColor')
            .populate('bidder', 'name email');
        }

        // If auction is LIVE but timer was not ticking, start it
        if (auction && auction.status === 'LIVE' && !auctionEngine.isTimerRunning) {
          auctionEngine.startTimer(auctionEngine.remainingSeconds > 0 ? auctionEngine.remainingSeconds : 15);
          if (auctionEngine.aiBiddingEnabled) {
            auctionEngine.scheduleAiBid(3000);
          }
        }

        socket.emit('auction:sync', {
          auction,
          bids,
          remainingSeconds: auctionEngine.remainingSeconds,
          isTimerRunning: auctionEngine.isTimerRunning
        });
      } catch (err) {
        console.error('[Socket.IO] Error syncing on join:', err.message);
      }
    });

    // Start round from client
    socket.on('auction:start-round', async () => {
      try {
        const auction = await auctionEngine.getOrCreateActiveAuction();
        if (auction && auction.status !== 'LIVE') {
          await auctionEngine.startAuction(auction._id);
        }
      } catch (err) {
        console.error('[Socket.IO] Error starting round:', err.message);
      }
    });

    const autoPauseIfEmpty = async () => {
      try {
        const room = io.sockets.adapter.rooms.get('auction_room');
        const count = room ? room.size : 0;
        if (count === 0 && auctionEngine.isTimerRunning) {
          console.log('[Auction] Room is now empty. Auto-pausing auction.');
          const auction = await auctionEngine.getOrCreateActiveAuction();
          if (auction && auction.status === 'LIVE') {
            await auctionEngine.pauseAuction(auction._id);
          }
        }
      } catch (err) {
        // ignore
      }
    };

    // Leave auction room
    socket.on('auction:leave', async () => {
      socket.leave('auction_room');
      await autoPauseIfEmpty();
    });

    // Auto-pause when user logs out
    socket.on('auth:logout', async () => {
      try {
        console.log('[Auction] User logged out. Automatically pausing active auction.');
        const auction = await auctionEngine.getOrCreateActiveAuction();
        if (auction && auction.status === 'LIVE') {
          await auctionEngine.pauseAuction(auction._id);
        }
      } catch (err) {
        console.error('[Auction] Error pausing on auth:logout:', err.message);
      }
    });

    // Live bidding via Socket
    socket.on('auction:bid', async (payload) => {
      try {
        const { token, auctionId, teamId, amount } = payload;
        if (!token) {
          return socket.emit('auction:error', { message: 'Authentication required to place bid' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
          return socket.emit('auction:error', { message: 'User not found' });
        }

        if (user.role !== 'TEAM_OWNER' && user.role !== 'ADMIN') {
          return socket.emit('auction:error', { message: 'Only Team Owners can place bids' });
        }

        await auctionEngine.placeBid({
          auctionId,
          userId: user._id,
          userRole: user.role,
          teamId,
          amount
        });
      } catch (err) {
        socket.emit('auction:error', { message: err.message });
      }
    });

    // Right to Match (RTM) decision from client
    socket.on('auction:rtm-decision', async (payload) => {
      try {
        const { auctionId, matched } = payload;
        await auctionEngine.resolveRtm(auctionId, matched, 'User Decision');
      } catch (err) {
        console.error('[Socket.IO] Error resolving RTM:', err.message);
      }
    });

    // Multiplayer Custom Room handlers
    socket.on('room:join', ({ roomCode, userName }) => {
      if (!roomCode) return;
      const channel = `room_${roomCode.toUpperCase()}`;
      socket.join(channel);
      io.to(channel).emit('room:notification', {
        type: 'JOIN',
        message: `${userName || 'A cricket fan'} stepped into the war room.`
      });
    });

    socket.on('room:leave', ({ roomCode, userName }) => {
      if (!roomCode) return;
      const channel = `room_${roomCode.toUpperCase()}`;
      socket.leave(channel);
      io.to(channel).emit('room:notification', {
        type: 'LEAVE',
        message: `${userName || 'A participant'} left the war room.`
      });
    });

    socket.on('room:update', ({ roomCode, roomData }) => {
      if (!roomCode) return;
      const channel = `room_${roomCode.toUpperCase()}`;
      io.to(channel).emit('room:sync', roomData);
    });

    socket.on('room:start', ({ roomCode }) => {
      if (!roomCode) return;
      const channel = `room_${roomCode.toUpperCase()}`;
      io.to(channel).emit('room:started', { roomCode });
    });

    socket.on('room:message', ({ roomCode, userName, message, teamLogo }) => {
      if (!roomCode || !message) return;
      const channel = `room_${roomCode.toUpperCase()}`;
      io.to(channel).emit('room:new-message', {
        sender: userName || 'Manager',
        text: message,
        teamLogo: teamLogo || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    socket.on('disconnect', async () => {
      await autoPauseIfEmpty();
    });

  });
};
