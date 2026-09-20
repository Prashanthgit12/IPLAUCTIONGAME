const axios = require('axios');

async function test() {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'owner.mm@auctionx.com',
      password: 'password123'
    });
    console.log('Login success! User team:', login.data.data.user.team?.name);
    const token = login.data.data.token;
    
    const activeRes = await axios.get('http://localhost:5000/api/auctions/active');
    const auction = activeRes.data.data.auction;
    console.log('Active auction player:', auction.currentPlayer?.name);
    console.log('Player Base Price:', auction.currentPlayer?.basePrice);
    console.log('Player Image:', auction.currentPlayer?.image);
    console.log('Player Stats:', JSON.stringify(auction.currentPlayer?.stats));
    
    // Place a bid
    const bidRes = await axios.post(`http://localhost:5000/api/auctions/${auction._id}/bid`, {
      teamId: login.data.data.user.team._id,
      amount: 20000000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Bid successfully placed!');
    console.log('Current Bid:', bidRes.data.data.auction.currentBid);
    console.log('Leading Team:', bidRes.data.data.auction.currentTeam?.name);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
