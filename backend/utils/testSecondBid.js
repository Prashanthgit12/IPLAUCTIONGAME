const axios = require('axios');

async function testSecondBid() {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'owner.cc@auctionx.com',
      password: 'password123'
    });
    console.log('Login CC success! User team:', login.data.data.user.team?.name);
    const token = login.data.data.token;
    
    const activeRes = await axios.get('http://localhost:5000/api/auctions/active');
    const auction = activeRes.data.data.auction;
    
    // Place a bid of 2.25 Cr
    const bidRes = await axios.post(`http://localhost:5000/api/auctions/${auction._id}/bid`, {
      teamId: login.data.data.user.team._id,
      amount: 22500000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Counter-bid placed!');
    console.log('New Current Bid:', bidRes.data.data.auction.currentBid);
    console.log('New Leading Team:', bidRes.data.data.auction.currentTeam?.name);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testSecondBid();
