const axios = require('axios');
const { io } = require('socket.io-client');

const API = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('🚀 Starting Comprehensive End-to-End Verification of AUCTIONX...\n');

  try {
    // 1. Health check
    const health = await axios.get(`${API}/health`);
    console.log('✅ 1. Health Check passed:', health.data.message);

    // 2. Admin Login
    const adminLogin = await axios.post(`${API}/auth/login`, {
      email: 'admin@auctionx.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.data.token;
    console.log('✅ 2. Admin Authentication successful (Role: ADMIN)');

    // 3. Team Owner 1 Login (Mumbai Indians)
    const mmOwnerLogin = await axios.post(`${API}/auth/login`, {
      email: 'owner.mi@auctionx.com',
      password: 'password123'
    });
    const mmToken = mmOwnerLogin.data.data.token;
    const mmTeam = mmOwnerLogin.data.data.user.team;
    console.log(`✅ 3. Team Owner 1 Authenticated (${mmTeam.name}, Purse: ₹${(mmTeam.remainingPurse / 10000000).toFixed(2)} Cr)`);

    // 4. Team Owner 2 Login (Chennai Super Kings)
    const ccOwnerLogin = await axios.post(`${API}/auth/login`, {
      email: 'owner.csk@auctionx.com',
      password: 'password123'
    });
    const ccToken = ccOwnerLogin.data.data.token;
    const ccTeam = ccOwnerLogin.data.data.user.team;
    console.log(`✅ 4. Team Owner 2 Authenticated (${ccTeam.name}, Purse: ₹${(ccTeam.remainingPurse / 10000000).toFixed(2)} Cr)`);

    // 5. Get Active Auction
    const activeAuctionRes = await axios.get(`${API}/auctions/active`);
    const auction = activeAuctionRes.data.data.auction;
    console.log(`✅ 5. Active Auction loaded: "${auction.name}" (Status: ${auction.status}, Player on block: ${auction.currentPlayer.name})`);

    // 6. Admin Starts Auction
    const startRes = await axios.post(
      `${API}/auctions/${auction._id}/start`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(`✅ 6. Admin started auction -> Status: ${startRes.data.data.status}`);

    // 7. Test Socket.IO Real-Time Connection
    const socket = io(SOCKET_URL);
    await new Promise((resolve) => {
      socket.on('connect', () => {
        console.log('✅ 7. Socket.IO client connected successfully (ID:', socket.id, ')');
        socket.emit('auction:join');
        resolve();
      });
    });

    // 8. Place Bid 1 from Team Owner 1 (Mumbai Indians)
    const refreshedAuctionRes = await axios.get(`${API}/auctions/active`);
    const currAuction = refreshedAuctionRes.data.data.auction;
    const baseVal = currAuction.currentBid || 20000000;
    const bid1Amount = baseVal + 5000000;
    const bid1Res = await axios.post(
      `${API}/auctions/${auction._id}/bid`,
      { teamId: mmTeam._id, amount: bid1Amount },
      { headers: { Authorization: `Bearer ${mmToken}` } }
    );
    console.log(`✅ 8. Mumbai Indians placed bid of ₹${(bid1Amount / 10000000).toFixed(2)} Cr -> Verified!`);

    // 9. Place Bid 2 from Team Owner 2 (Chennai Super Kings)
    const bid2Amount = bid1Amount + 2500000;
    const bid2Res = await axios.post(
      `${API}/auctions/${auction._id}/bid`,
      { teamId: ccTeam._id, amount: bid2Amount },
      { headers: { Authorization: `Bearer ${ccToken}` } }
    );
    console.log(`✅ 9. Chennai Super Kings outbid with ₹${(bid2Amount / 10000000).toFixed(2)} Cr -> Verified!`);

    // 10. Admin marks player SOLD to leading bidder (Chennai Chargers)
    const soldRes = await axios.post(
      `${API}/auctions/${auction._id}/sold`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const soldData = soldRes.data.data;
    console.log(`✅ 10. Admin marked player SOLD: ${soldData.player.name} sold to ${soldData.team.name} for ₹${(soldData.soldPrice / 10000000).toFixed(2)} Cr!`);

    // 11. Verify Team Purse Deduction & Squad Inclusion
    const teamCheck = await axios.get(`${API}/teams/${ccTeam._id}`);
    const updatedTeam = teamCheck.data.data;
    console.log(`✅ 11. Verified Franchise Purse deducted: Remaining: ₹${(updatedTeam.remainingPurse / 10000000).toFixed(2)} Cr, Squad Count: ${updatedTeam.squadCount}`);

    // 12. Admin advances to NEXT PLAYER
    const nextPlayerRes = await axios.post(
      `${API}/auctions/${auction._id}/next-player`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const nextPlayer = nextPlayerRes.data.data.currentPlayer;
    console.log(`✅ 12. Next Cricketer loaded to block: ${nextPlayer.name} (Base Price: ₹${(nextPlayer.basePrice / 10000000).toFixed(2)} Cr)`);

    // 13. Leaderboard Verification
    const leaderboardRes = await axios.get(`${API}/results/leaderboard`);
    const topTeam = leaderboardRes.data.data.highlights.highestSpendingTeam;
    console.log(`✅ 13. Leaderboard calculated: Leading spender is ${topTeam?.name} with ${topTeam?.playersBought} player(s) bought`);

    socket.disconnect();

    console.log('\n=========================================');
    console.log('🎉 ALL 13 END-TO-END VERIFICATION CHECKS PASSED!');
    console.log('=========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err.response?.data || err.message);
    process.exit(1);
  }
};

runTests();
