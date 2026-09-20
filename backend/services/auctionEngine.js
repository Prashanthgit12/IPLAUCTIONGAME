const Auction = require('../models/Auction');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');
const AuctionResult = require('../models/AuctionResult');
const User = require('../models/User');

class AuctionEngine {
  constructor() {
    this.io = null;
    this.timerInterval = null;
    this.remainingSeconds = 15;
    this.activeAuction = null;
    this.isTimerRunning = false;
    this.aiBidTimeout = null;
    this.nextPlayerTimeout = null;
    this.aiBiddingEnabled = true; // Intelligent AI Bidding enabled for mock simulation
  }

  setIO(ioInstance) {
    this.io = ioInstance;
  }

  // Load or create active auction
  async getOrCreateActiveAuction() {
    let auction = await Auction.findOne({ status: { $in: ['LIVE', 'PAUSED', 'IDLE'] } })
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction) {
      auction = await Auction.create({
        name: 'Premier Cricket Auction 2026',
        status: 'IDLE',
        bidIncrement: 2500000,
        rules: {
          initialPurse: 1200000000,
          maxSquadSize: 25,
          minSquadSize: 18,
          maxOverseas: 8,
          timerSeconds: 15,
          resetTimerSeconds: 10,
          snipeThresholdSeconds: 5
        }
      });
    }

    this.activeAuction = auction;
    return auction;
  }

  // Calculate minimum valid bid increment
  calculateMinIncrement(currentBid) {
    if (!currentBid || currentBid < 10000000) { // < 1 Cr
      return 1000000; // 10 Lakhs
    } else if (currentBid < 50000000) { // 1 Cr - 5 Cr
      return 2500000; // 25 Lakhs
    } else if (currentBid < 100000000) { // 5 Cr - 10 Cr
      return 5000000; // 50 Lakhs
    } else { // > 10 Cr
      return 10000000; // 1 Cr
    }
  }

  // Start authoritative timer
  startTimer(durationSeconds = 15) {
    this.stopTimer();
    this.remainingSeconds = durationSeconds;
    this.isTimerRunning = true;

    if (this.io) {
      this.io.emit('auction:timer-update', {
        remainingSeconds: this.remainingSeconds,
        isTimerRunning: true
      });
    }

    this.timerInterval = setInterval(async () => {
      this.remainingSeconds -= 1;

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.stopTimer();

        if (this.io) {
          this.io.emit('auction:timer-update', {
            remainingSeconds: 0,
            isTimerRunning: false,
            timerExpired: true
          });
        }

        // Automatic round completion and progress to next player
        this.handleRoundCompletion();
      } else {
        if (this.io) {
          this.io.emit('auction:timer-update', {
            remainingSeconds: this.remainingSeconds,
            isTimerRunning: true
          });
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    if (this.aiBidTimeout) {
      clearTimeout(this.aiBidTimeout);
      this.aiBidTimeout = null;
    }
  }

  // Handle automatic round completion when countdown reaches 0
  async handleRoundCompletion() {
    if (!this.activeAuction) return;

    try {
      const auction = await Auction.findById(this.activeAuction._id)
        .populate('currentPlayer')
        .populate('currentTeam');

      if (!auction || auction.status !== 'LIVE' || !auction.currentPlayer) return;

      const player = await Player.findById(auction.currentPlayer._id);
      if (!player || player.status !== 'IN_AUCTION') return;

      if (auction.currentTeam) {
        // Check for official IPL RTM (Right to Match) opportunity
        const previousTeamId = player.previousTeam ? player.previousTeam.toString() : null;
        const winningTeamId = auction.currentTeam._id.toString();

        if (previousTeamId && previousTeamId !== winningTeamId && !this.rtmInProgress) {
          const prevTeam = await Team.findById(previousTeamId);
          const availableRtm = (prevTeam?.rtmCards ?? 2) - (prevTeam?.rtmUsed ?? 0);
          // RTM opportunity is ONLY offered if a real human user has registered as the franchise owner
          if (prevTeam && prevTeam.owner && availableRtm > 0 && prevTeam.remainingPurse >= auction.currentBid) {
            console.log(`[Auction RTM] Offering Right to Match opportunity to owner of ${prevTeam.name} on ${player.name} at ₹${(auction.currentBid / 10000000).toFixed(2)} Cr!`);
            this.triggerRtmWindow(auction, player, prevTeam, auction.currentTeam, auction.currentBid);
            return;
          }
        }

        console.log(`[Auction] Hammer fell! ${player.name} SOLD to ${auction.currentTeam.name} for ₹${(auction.currentBid / 10000000).toFixed(2)} Cr!`);
        await this.markSold(auction._id);
      } else {
        console.log(`[Auction] Round expired with no bids. Marking ${player.name} UNSOLD.`);
        await this.markUnsold(auction._id);
      }

      // Schedule automated transition to next cricketer after 5-second celebration window
      if (this.nextPlayerTimeout) {
        clearTimeout(this.nextPlayerTimeout);
      }

      this.nextPlayerTimeout = setTimeout(async () => {
        try {
          console.log('[Auction] Intermission complete. Bringing next cricketer to the block...');
          await this.nextPlayer(auction._id);
        } catch (err) {
          console.error('[Auction] Failed to transition to next player:', err.message);
        }
      }, 5000);
    } catch (err) {
      console.error('[Auction] Error in handleRoundCompletion:', err);
    }
  }

  // Trigger Right to Match decision window
  async triggerRtmWindow(auction, player, rtmTeam, winningTeam, winningBid) {
    this.rtmInProgress = true;
    this.rtmDetails = {
      auctionId: auction._id,
      playerId: player._id,
      rtmTeamId: rtmTeam._id,
      winningTeamId: winningTeam._id,
      winningBid
    };

    if (this.io) {
      this.io.emit('auction:rtm-prompt', {
        player,
        rtmTeam: {
          _id: rtmTeam._id,
          name: rtmTeam.name,
          shortName: rtmTeam.shortName,
          logo: rtmTeam.logo,
          primaryColor: rtmTeam.primaryColor,
          rtmCards: (rtmTeam.rtmCards ?? 2) - (rtmTeam.rtmUsed ?? 0)
        },
        winningTeam: {
          _id: winningTeam._id,
          name: winningTeam.name,
          shortName: winningTeam.shortName,
          logo: winningTeam.logo,
          primaryColor: winningTeam.primaryColor
        },
        winningBid,
        durationSeconds: 8
      });
    }

    // If no manual response from the owner within duration, default to DECLINE (never auto-match)
    if (this.rtmTimeout) clearTimeout(this.rtmTimeout);
    this.rtmTimeout = setTimeout(async () => {
      if (!this.rtmInProgress) return;
      console.log(`[Auction RTM] Time expired without decision from ${rtmTeam.name}. Declining RTM.`);
      await this.resolveRtm(auction._id, false, 'Time expired - declined');
    }, 10000);
  }

  // Resolve Right to Match
  async resolveRtm(auctionId, matched, reason = '') {
    if (!this.rtmInProgress || !this.rtmDetails) return;
    if (this.rtmTimeout) {
      clearTimeout(this.rtmTimeout);
      this.rtmTimeout = null;
    }

    this.rtmInProgress = false;
    const { rtmTeamId, winningBid } = this.rtmDetails;
    this.rtmDetails = null;

    const auction = await Auction.findById(auctionId).populate('currentPlayer');
    if (!auction) return;

    if (matched) {
      const rtmTeam = await Team.findById(rtmTeamId);
      if (rtmTeam && rtmTeam.remainingPurse >= winningBid) {
        rtmTeam.rtmUsed = (rtmTeam.rtmUsed || 0) + 1;
        rtmTeam.rtmCards = Math.max(0, (rtmTeam.rtmCards ?? 2) - 1);
        await rtmTeam.save();

        auction.currentTeam = rtmTeam._id;
        await auction.save();

        const remainingRtmCards = Math.max(0, (rtmTeam.rtmCards ?? 2) - (rtmTeam.rtmUsed ?? 0));

        if (this.io) {
          this.io.emit('auction:rtm-resolved', {
            matched: true,
            matchedTeam: rtmTeam,
            winningBid,
            rtmCardsLeft: remainingRtmCards,
            message: `RTM EXERCISED! ${rtmTeam.name} matched the highest bid of ₹${(winningBid / 10000000).toFixed(2)} Cr! (${remainingRtmCards} RTM remaining)`
          });
        }
      }
    } else {
      if (this.io) {
        this.io.emit('auction:rtm-resolved', {
          matched: false,
          message: `RTM DECLINED! Sold to the leading franchise.`
        });
      }
    }

    // Finalize SOLD
    await this.markSold(auction._id);

    // Schedule next player
    if (this.nextPlayerTimeout) clearTimeout(this.nextPlayerTimeout);
    this.nextPlayerTimeout = setTimeout(async () => {
      try {
        await this.nextPlayer(auction._id);
      } catch (err) {
        console.error('[Auction] Error transitioning to next player after RTM:', err.message);
      }
    }, 5000);
  }

  // Calculate AI franchise valuation for a cricketer
  calculateTeamValuation(team, player) {
    if (!player || !team) return 0;
    const basePrice = player.basePrice || 20000000;
    const rating = player.rating || 80;

    // Base multiplier based on player skill & prestige
    let multiplier = 1.2;
    if (rating >= 93) {
      // Marquee superstars (Kohli, Rohit, Bumrah, Starc, Rashid, etc.)
      multiplier = 5.5 + Math.random() * 3.5; // ₹11 - ₹18 Cr
    } else if (rating >= 88) {
      // Proven IPL match-winners
      multiplier = 3.5 + Math.random() * 2.5; // ₹7 - ₹12 Cr
    } else if (rating >= 82) {
      // Core playing XI starters
      multiplier = 2.2 + Math.random() * 1.8; // ₹4.5 - ₹8 Cr
    } else if (rating >= 76) {
      // Reliable squad players
      multiplier = 1.4 + Math.random() * 1.2; // ₹2.5 - ₹5 Cr
    } else {
      // Emerging & uncapped depth
      multiplier = 1.0 + Math.random() * 0.6; // ₹1 - ₹2.5 Cr
    }

    // Role-based tactical adjustment
    const teamPlayers = team.players || [];
    const role = (player.role || player.category || '').toUpperCase();
    const roleCount = teamPlayers.filter((p) => {
      const pRole = (p.player?.role || p.player?.category || '').toUpperCase();
      return pRole.includes(role);
    }).length;

    // If team has fewer players in this role, increase willingness to bid by 20%
    if (roleCount < 3) {
      multiplier *= 1.2;
    }

    let maxValuation = Math.round(basePrice * multiplier);

    // Purse safety rules:
    // 1. Never spend more than 28% of total current remaining purse on one player (35% for 90+ rated)
    const maxPercentOfPurse = rating >= 90 ? 0.35 : 0.28;
    const purseCap = Math.round(team.remainingPurse * maxPercentOfPurse);
    maxValuation = Math.min(maxValuation, purseCap);

    // 2. Minimum squad reserve: must retain at least ₹20 Lakhs per unfilled slot up to 18 minimum players
    const currentSquadCount = teamPlayers.length;
    const remainingSlotsNeeded = Math.max(0, 18 - (currentSquadCount + 1));
    const safetyReserve = remainingSlotsNeeded * 2000000;

    const maxAffordable = team.remainingPurse - safetyReserve;
    return Math.max(0, Math.min(maxValuation, maxAffordable));
  }

  // Schedule AI franchise counter-bid
  scheduleAiBid(delayMs = null) {
    if (!this.aiBiddingEnabled) return;
    if (this.aiBidTimeout) {
      clearTimeout(this.aiBidTimeout);
      this.aiBidTimeout = null;
    }

    if (!this.isTimerRunning || this.remainingSeconds <= 1) {
      return;
    }

    // Natural human-like reaction time: 1.8 to 3.5 seconds if not specified
    const delay = delayMs !== null ? delayMs : Math.floor(Math.random() * 1700) + 1800;

    this.aiBidTimeout = setTimeout(async () => {
      try {
        await this.executeAiBid();
      } catch (err) {
        console.error('[AI Bid Error]', err.message);
      }
    }, delay);
  }

  // Execute an AI franchise bid
  async executeAiBid() {
    if (!this.aiBiddingEnabled || !this.isTimerRunning || this.remainingSeconds <= 1) {
      return;
    }

    if (this.rtmInProgress) {
      return;
    }

    if (!this.activeAuction || this.activeAuction.status !== 'LIVE') {
      return;
    }

    const auction = await Auction.findById(this.activeAuction._id)
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction || auction.status !== 'LIVE' || !auction.currentPlayer) {
      return;
    }

    const player = await Player.findById(auction.currentPlayer._id);
    if (!player || player.status !== 'IN_AUCTION') {
      return;
    }

    const currentBid = auction.currentBid || player.basePrice;
    const currentLeadingTeamId = auction.currentTeam ? auction.currentTeam._id.toString() : null;
    const minIncrement = this.calculateMinIncrement(currentBid);
    const nextBid = auction.currentTeam ? currentBid + minIncrement : player.basePrice;

    // Fetch all franchises
    const allTeams = await Team.find().populate('players.player');

    // Eligible AI candidate teams:
    // 1. Must NOT be the current leading team
    // 2. Must NOT be owned by a human user (owner === null) so AI never bids as the human's team
    // 3. Must have remainingPurse >= nextBid
    // 4. Must not have exceeded squad limit (maxSquadSize: 25)
    // 5. Must not have exceeded overseas limit if player is overseas (maxOverseas: 8)
    const eligibleTeams = allTeams.filter((team) => {
      // Cannot bid against self
      if (currentLeadingTeamId && team._id.toString() === currentLeadingTeamId) {
        return false;
      }

      // Only unowned AI teams (owner === null)
      if (team.owner) {
        return false;
      }

      // Check purse
      if (team.remainingPurse < nextBid) {
        return false;
      }

      // Check squad size
      if ((team.players?.length || 0) >= (team.maxSquadSize || 25)) {
        return false;
      }

      // Check overseas quota
      if (player.isOverseas) {
        const overseasCount = (team.players || []).filter((p) => p.player && p.player.isOverseas).length;
        if (overseasCount >= (team.maxOverseas || 8)) {
          return false;
        }
      }

      // Check valuation
      const valuation = this.calculateTeamValuation(team, player);
      return valuation >= nextBid;
    });

    if (eligibleTeams.length === 0) {
      // No AI team willing to bid at this price level
      return;
    }

    // Pick a candidate team (weighted towards teams with higher purse)
    eligibleTeams.sort((a, b) => b.remainingPurse - a.remainingPurse);
    const pickPool = eligibleTeams.slice(0, Math.min(3, eligibleTeams.length));
    const chosenTeam = pickPool[Math.floor(Math.random() * pickPool.length)];

    // Get tournament administrator user to place authorized system bid
    let adminUser = await User.findOne({ role: 'ADMIN' });
    const adminId = adminUser ? adminUser._id : '65f1a1a1a1a1a1a1a1a1a1a1';

    console.log(`[AI Bid] ${chosenTeam.name} placing counter-bid of ₹${(nextBid / 10000000).toFixed(2)} Cr on ${player.name}`);

    // Place the AI bid
    await this.placeBid({
      auctionId: auction._id,
      userId: adminId,
      userRole: 'ADMIN',
      teamId: chosenTeam._id,
      amount: nextBid
    });

    // Schedule next potential AI counter-bid if multiple teams are still interested
    if (eligibleTeams.length > 1) {
      this.scheduleAiBid(Math.floor(Math.random() * 1500) + 2000);
    }
  }

  // Start or resume auction
  async startAuction(auctionId) {
    const auction = await Auction.findById(auctionId)
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction) {
      throw new Error('Auction not found');
    }

    // If no current player is on block, pick first available player
    if (!auction.currentPlayer) {
      const player = await Player.findOne({ status: 'AVAILABLE' }).sort({ category: 1, basePrice: -1 });
      if (player) {
        player.status = 'IN_AUCTION';
        await player.save();
        auction.currentPlayer = player;
        auction.currentBid = player.basePrice;
        auction.currentTeam = null;
      }
    }

    auction.status = 'LIVE';
    if (!auction.startedAt) auction.startedAt = new Date();
    await auction.save();

    this.activeAuction = auction;
    this.startTimer(auction.rules.timerSeconds || 15);

    if (this.io) {
      this.io.emit('auction:started', { auction });
    }

    if (this.aiBiddingEnabled) {
      this.scheduleAiBid(3500);
    }

    return auction;
  }

  // Pause auction
  async pauseAuction(auctionId) {
    const auction = await Auction.findById(auctionId)
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction) throw new Error('Auction not found');

    auction.status = 'PAUSED';
    await auction.save();

    this.stopTimer();
    this.activeAuction = auction;

    if (this.io) {
      this.io.emit('auction:paused', {
        auction,
        remainingSeconds: this.remainingSeconds
      });
    }

    return auction;
  }

  // Resume auction
  async resumeAuction(auctionId) {
    const auction = await Auction.findById(auctionId)
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction) throw new Error('Auction not found');

    auction.status = 'LIVE';
    await auction.save();

    this.activeAuction = auction;
    this.startTimer(this.remainingSeconds > 0 ? this.remainingSeconds : (auction.rules.timerSeconds || 15));

    if (this.io) {
      this.io.emit('auction:resumed', { auction });
    }

    if (this.aiBiddingEnabled) {
      this.scheduleAiBid(2500);
    }

    return auction;
  }

  // End auction
  async endAuction(auctionId) {
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new Error('Auction not found');

    auction.status = 'ENDED';
    auction.endedAt = new Date();
    await auction.save();

    this.stopTimer();
    this.activeAuction = auction;

    if (this.io) {
      this.io.emit('auction:ended', { auction });
    }

    return auction;
  }

  // Place a Bid with full validation
  async placeBid({ auctionId, userId, userRole, teamId, amount }) {
    const auction = await Auction.findById(auctionId)
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction) throw new Error('Auction not found');
    if (auction.status === 'ENDED') throw new Error('Auction has ended');
    if (!auction.currentPlayer) throw new Error('No player is currently on the auction block');

    // Auto-activate round and start timer if not already live
    if (auction.status !== 'LIVE') {
      auction.status = 'LIVE';
      if (!auction.startedAt) auction.startedAt = new Date();
    }

    const player = await Player.findById(auction.currentPlayer._id);
    if (!player) throw new Error('Current player record not found');

    // Team validation
    const idToFind = (teamId && typeof teamId === 'object' && teamId._id) ? teamId._id : teamId;
    const team = await Team.findById(idToFind);
    if (!team) throw new Error('Team not found');

    // Check team owner
    if (userRole !== 'ADMIN' && team.owner && team.owner.toString() !== userId.toString()) {
      throw new Error('You can only place bids on behalf of your assigned team');
    }

    // Check if team already has highest bid
    if (auction.currentTeam && auction.currentTeam._id.toString() === team._id.toString()) {
      throw new Error('Your team already holds the highest bid');
    }

    const proposedAmount = Number(amount);
    if (isNaN(proposedAmount) || proposedAmount <= 0) {
      throw new Error('Invalid bid amount');
    }

    // Check if bid is high enough
    const minIncrement = this.calculateMinIncrement(auction.currentBid);
    const minNextBid = auction.currentTeam ? auction.currentBid + minIncrement : player.basePrice;

    if (proposedAmount < minNextBid) {
      throw new Error(`Bid amount must be at least ₹${(minNextBid / 10000000).toFixed(2)} Cr (Increment: ₹${(minIncrement / 100000).toFixed(0)} Lakhs)`);
    }

    // Check team purse
    if (team.remainingPurse < proposedAmount) {
      throw new Error(`Insufficient purse! Team has ₹${(team.remainingPurse / 10000000).toFixed(2)} Cr remaining`);
    }

    // Check squad size limit
    if (team.players.length >= team.maxSquadSize) {
      throw new Error(`Squad limit reached (${team.maxSquadSize} players maximum)`);
    }

    // Check overseas limit if player is overseas
    if (player.isOverseas) {
      const overseasCount = team.players.filter((p) => p.player && p.player.isOverseas).length;
      if (overseasCount >= team.maxOverseas) {
        throw new Error(`Maximum overseas quota reached (${team.maxOverseas} overseas players maximum)`);
      }
    }

    // Create Bid Record
    const bid = await Bid.create({
      auction: auction._id,
      player: player._id,
      team: team._id,
      bidder: userId,
      amount: proposedAmount,
      timestamp: new Date()
    });

    // Update auction state
    auction.currentBid = proposedAmount;
    auction.currentTeam = team._id;
    auction.bidIncrement = minIncrement;
    await auction.save();

    // Anti-sniping: Reset timer to 10s if under 5s, or start if stopped
    if (!this.isTimerRunning || this.remainingSeconds <= (auction.rules.snipeThresholdSeconds || 5)) {
      this.remainingSeconds = Math.max(auction.rules.resetTimerSeconds || 10, this.remainingSeconds || 15);
    }
    this.startTimer(this.remainingSeconds);

    // Populate auction with current team details for broadcasting
    const updatedAuction = await Auction.findById(auction._id)
      .populate('currentPlayer')
      .populate('currentTeam');

    this.activeAuction = updatedAuction;

    const populatedBid = await Bid.findById(bid._id)
      .populate('team', 'name shortName logo primaryColor')
      .populate('bidder', 'name email');

    // Broadcast new bid to all connected clients
    if (this.io) {
      this.io.emit('auction:new-bid', {
        bid: populatedBid,
        auction: updatedAuction,
        remainingSeconds: this.remainingSeconds
      });
    }

    // Trigger AI counter-bid if AI bidding is active
    if (this.aiBiddingEnabled) {
      this.scheduleAiBid(Math.floor(Math.random() * 1200) + 1800);
    }

    return { bid: populatedBid, auction: updatedAuction };
  }

  // Mark current player SOLD
  async markSold(auctionId) {
    const auction = await Auction.findById(auctionId)
      .populate('currentPlayer')
      .populate('currentTeam');

    if (!auction) throw new Error('Auction not found');
    if (!auction.currentPlayer) throw new Error('No player is currently on the block');
    if (!auction.currentTeam) throw new Error('Cannot mark player SOLD without a bidding team');

    const player = await Player.findById(auction.currentPlayer._id);
    const team = await Team.findById(auction.currentTeam._id);
    const soldPrice = auction.currentBid;

    // Deduct team purse
    team.remainingPurse -= soldPrice;
    team.players.push({
      player: player._id,
      buyPrice: soldPrice,
      boughtAt: new Date()
    });
    await team.save();

    // Update player
    player.status = 'SOLD';
    player.soldTo = team._id;
    player.soldPrice = soldPrice;
    await player.save();

    // Count bids
    const numberOfBids = await Bid.countDocuments({
      auction: auction._id,
      player: player._id
    });

    // Create AuctionResult
    const result = await AuctionResult.create({
      auction: auction._id,
      player: player._id,
      team: team._id,
      soldPrice,
      status: 'SOLD',
      numberOfBids,
      timestamp: new Date()
    });

    this.stopTimer();

    const populatedResult = await AuctionResult.findById(result._id)
      .populate('player')
      .populate('team');

    // Broadcast SOLD celebration and updated team
    if (this.io) {
      this.io.emit('auction:player-sold', {
        player,
        team,
        soldPrice,
        result: populatedResult
      });
      this.io.emit('team:updated', {
        teamId: team._id,
        team
      });
    }

    return populatedResult;
  }

  // Mark current player UNSOLD
  async markUnsold(auctionId) {
    const auction = await Auction.findById(auctionId).populate('currentPlayer');
    if (!auction) throw new Error('Auction not found');
    if (!auction.currentPlayer) throw new Error('No player on the block');

    const player = await Player.findById(auction.currentPlayer._id);
    player.status = 'UNSOLD';
    await player.save();

    const numberOfBids = await Bid.countDocuments({
      auction: auction._id,
      player: player._id
    });

    const result = await AuctionResult.create({
      auction: auction._id,
      player: player._id,
      team: null,
      soldPrice: 0,
      status: 'UNSOLD',
      numberOfBids,
      timestamp: new Date()
    });

    this.stopTimer();

    const populatedResult = await AuctionResult.findById(result._id).populate('player');

    if (this.io) {
      this.io.emit('auction:player-unsold', {
        player,
        result: populatedResult
      });
    }

    return populatedResult;
  }

  // Move to next player
  async nextPlayer(auctionId, specificPlayerId = null) {
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new Error('Auction not found');

    let player;
    if (specificPlayerId) {
      player = await Player.findById(specificPlayerId);
      if (!player) throw new Error('Selected player not found');
    } else {
      player = await Player.findOne({ status: 'AVAILABLE' }).sort({ category: 1, basePrice: -1 });
    }

    if (!player) {
      // All players auctioned
      auction.currentPlayer = null;
      auction.currentBid = 0;
      auction.currentTeam = null;
      auction.status = 'ENDED';
      await auction.save();
      this.stopTimer();

      if (this.io) {
        this.io.emit('auction:ended', { message: 'All available players have been auctioned' });
      }

      return null;
    }

    // Set player IN_AUCTION
    player.status = 'IN_AUCTION';
    await player.save();

    auction.currentPlayer = player._id;
    auction.currentBid = player.basePrice;
    auction.currentTeam = null;
    auction.bidIncrement = this.calculateMinIncrement(player.basePrice);
    auction.status = 'LIVE';
    await auction.save();

    const updatedAuction = await Auction.findById(auction._id)
      .populate('currentPlayer')
      .populate('currentTeam');

    this.activeAuction = updatedAuction;
    this.startTimer(auction.rules.timerSeconds || 15);

    if (this.io) {
      this.io.emit('auction:next-player', {
        auction: updatedAuction,
        player
      });
    }

    if (this.aiBiddingEnabled) {
      this.scheduleAiBid(4000);
    }

    return updatedAuction;
  }

  // Reset auction to starting cricketer (Virat Kohli) with 0 bids and timer paused
  async resetAuctionToStart() {
    this.stopTimer();
    if (this.nextPlayerTimeout) {
      clearTimeout(this.nextPlayerTimeout);
      this.nextPlayerTimeout = null;
    }
    if (this.rtmTimeout) {
      clearTimeout(this.rtmTimeout);
      this.rtmTimeout = null;
    }
    this.rtmInProgress = false;
    this.aiBiddingEnabled = true;

    // Reset all auction bids and results
    await Bid.deleteMany({});
    await AuctionResult.deleteMany({});

    // Reset ALL players to AVAILABLE
    await Player.updateMany(
      {},
      { status: 'AVAILABLE', soldTo: null, soldPrice: null }
    );

    // Find Virat Kohli as starting cricketer
    const firstPlayer = (await Player.findOne({ name: 'Virat Kohli' })) || (await Player.findOne({ status: 'AVAILABLE' }));
    if (firstPlayer) {
      firstPlayer.status = 'IN_AUCTION';
      firstPlayer.soldTo = null;
      firstPlayer.soldPrice = null;
      await firstPlayer.save();
    }

    // Reset all teams to fresh starting state: 0 players, full ₹120 Cr purse, 2 RTM cards
    const teams = await Team.find();
    for (const team of teams) {
      team.players = [];
      team.remainingPurse = team.initialPurse || 1200000000;
      team.rtmCards = 2;
      team.rtmUsed = 0;
      await team.save();
    }

    let auction = await Auction.findOne({ status: { $in: ['LIVE', 'PAUSED', 'IDLE'] } });
    if (!auction) {
      auction = await Auction.create({
        name: 'TATA IPL Auction 2026',
        status: 'PAUSED',
        currentPlayer: firstPlayer ? firstPlayer._id : null,
        currentBid: firstPlayer ? firstPlayer.basePrice : 20000000,
        currentTeam: null,
        bidIncrement: 2500000,
        rules: {
          initialPurse: 1200000000,
          maxSquadSize: 25,
          minSquadSize: 18,
          maxOverseas: 8,
          timerSeconds: 15,
          resetTimerSeconds: 10,
          snipeThresholdSeconds: 5
        }
      });
    } else {
      auction.status = 'PAUSED';
      auction.currentPlayer = firstPlayer ? firstPlayer._id : null;
      auction.currentBid = firstPlayer ? firstPlayer.basePrice : 20000000;
      auction.currentTeam = null;
      await auction.save();
    }

    const populatedAuction = await Auction.findById(auction._id)
      .populate('currentPlayer')
      .populate('currentTeam');

    this.activeAuction = populatedAuction;
    this.remainingSeconds = populatedAuction.rules?.timerSeconds || 15;

    if (this.io) {
      this.io.emit('auction:reset', { auction: populatedAuction });
      this.io.emit('auction:next-player', { auction: populatedAuction, player: firstPlayer });
      this.io.emit('auction:timer-update', { remainingSeconds: this.remainingSeconds, isTimerRunning: false });
    }

    return populatedAuction;
  }
}

const auctionEngine = new AuctionEngine();
module.exports = auctionEngine;
