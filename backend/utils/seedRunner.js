const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const AuctionResult = require('../models/AuctionResult');
const { teamsData, playersData } = require('./seedData');

const runSeed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seed] Database connection active. Commencing seed process...');

    // Clear existing data
    await User.deleteMany();
    await Team.deleteMany();
    await Player.deleteMany();
    await Auction.deleteMany();
    await Bid.deleteMany();
    await AuctionResult.deleteMany();
    console.log('[Seed] Cleared existing collections.');

    // 1. Create Admin User (Prashanth) with fixed deterministic ID
    const adminUser = await User.create({
      _id: new mongoose.Types.ObjectId('65f1a1a1a1a1a1a1a1a1a1a1'),
      name: 'Prashanth',
      email: 'prashanth9392557522@gmail.com',
      password: 'IplAdmin123',
      role: 'ADMIN'
    });
    console.log('[Seed] Created Admin user: Prashanth (prashanth9392557522@gmail.com)');

    // 2. Create Teams (Clean, full ₹120 Cr purse, 0 players, owner: null - ready for real users after login)
    const createdTeams = [];
    for (const t of teamsData) {
      const team = await Team.create({
        name: t.name,
        shortName: t.shortName,
        initialPurse: 1200000000,
        remainingPurse: 1200000000,
        owner: null,
        players: [],
        primaryColor: t.primaryColor,
        secondaryColor: t.secondaryColor,
        logo: t.logo
      });
      createdTeams.push(team);
    }
    console.log(`[Seed] Created ${createdTeams.length} fresh teams with full ₹120 Cr purse and empty squads.`);

    const teamMap = {};
    for (const t of createdTeams) {
      teamMap[t.shortName] = t;
    }

    const previousTeamMap = {
      'Virat Kohli': 'RCB',
      'Rohit Sharma': 'MI',
      'Jasprit Bumrah': 'MI',
      'Hardik Pandya': 'MI',
      'MS Dhoni': 'CSK',
      'Ravindra Jadeja': 'CSK',
      'Rishabh Pant': 'DC',
      'Pat Cummins': 'SRH',
      'Mitchell Starc': 'KKR',
      'Sunil Narine': 'KKR',
      'Andre Russell': 'KKR',
      'Glenn Maxwell': 'RCB',
      'Jos Buttler': 'RR',
      'Sanju Samson': 'RR',
      'Shubman Gill': 'GT',
      'Rashid Khan': 'GT',
      'KL Rahul': 'LSG',
      'Nicholas Pooran': 'LSG',
      'Arshdeep Singh': 'PBKS',
      'Mohammed Shami': 'GT',
      'Kuldeep Yadav': 'DC',
      'Axar Patel': 'DC',
      'Suryakumar Yadav': 'MI',
      'Ruturaj Gaikwad': 'CSK',
      'Heinrich Klaasen': 'SRH',
      'Mayank Yadav': 'LSG',
      'Harshit Rana': 'KKR',
      'Yash Dayal': 'RCB',
      'Vaibhav Arora': 'KKR',
      'Mohsin Khan': 'LSG',
      'Suyash Sharma': 'KKR',
      'Shashank Singh': 'PBKS',
      'Ashutosh Sharma': 'PBKS',
      'Sameer Rizvi': 'CSK',
      'Angkrish Raghuvanshi': 'KKR',
      'Nehal Wadhera': 'MI',
      'Abishek Porel': 'DC',
      'Ramandeep Singh': 'KKR',
      'Naman Dhir': 'MI',
      'Shahrukh Khan': 'GT',
      'Kumar Kushagra': 'DC',
      'Robin Minz': 'GT',
      'Swapnil Singh': 'RCB',
      'Bhuvneshwar Kumar': 'SRH',
      'T Natarajan': 'SRH',
      'Yuzvendra Chahal': 'RR',
      'Ravi Bishnoi': 'LSG',
      'Varun Chakravarthy': 'KKR',
      'Ravichandran Ashwin': 'RR',
      'Travis Head': 'SRH',
      'David Miller': 'GT',
      'Rinku Singh': 'KKR',
      'Tilak Varma': 'MI',
      'Faf du Plessis': 'RCB',
      'David Warner': 'DC',
      'Rahul Tripathi': 'SRH',
      'Ishan Kishan': 'MI',
      'Phil Salt': 'KKR',
      'Dhruv Jurel': 'RR',
      'Sam Curran': 'PBKS',
      'Marcus Stoinis': 'LSG',
      'Shivam Dube': 'CSK',
      'Nitish Kumar Reddy': 'SRH',
      'Trent Boult': 'RR',
      'Kagiso Rabada': 'PBKS',
      'Mohammed Siraj': 'RCB',
      'Matheesha Pathirana': 'CSK',
      'Dewald Brevis': 'MI',
      'Vaibhav Suryavanshi': 'RR',
      'Ayush Mhatre': 'CSK',
      'Urvil Patel': 'GT'
    };

    const playersToInsert = playersData.map((p) => {
      const targetTeamShort = previousTeamMap[p.name];
      if (targetTeamShort && teamMap[targetTeamShort]) {
        return {
          ...p,
          status: 'AVAILABLE',
          soldTo: null,
          soldPrice: 0,
          previousTeam: teamMap[targetTeamShort]._id,
          previousTeamName: teamMap[targetTeamShort].name
        };
      }
      return {
        ...p,
        status: 'AVAILABLE',
        soldTo: null,
        soldPrice: 0
      };
    });

    // 3. Create Players (All available, 0 sold, completely fresh auction pool)
    const createdPlayers = await Player.insertMany(playersToInsert);
    console.log(`[Seed] Created ${createdPlayers.length} players. All available in auction pool.`);

    // 4. Create Default Auction at starting cricketer (Virat Kohli)
    const firstPlayer = createdPlayers.find((p) => p.name === 'Virat Kohli') || createdPlayers[0];
    firstPlayer.status = 'IN_AUCTION';
    await firstPlayer.save();

    const auction = await Auction.create({
      name: 'TATA IPL Auction 2026',
      status: 'PAUSED', // Paused at starting block so timer does not tick until bid or admin start
      startedAt: new Date(),
      currentPlayer: firstPlayer._id,
      currentBid: firstPlayer.basePrice,
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
    console.log(`[Seed] Initialized auction with player: ${firstPlayer.name} (Base Price: ₹${firstPlayer.basePrice / 10000000} Cr)`);

    console.log('\n=========================================');
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('-----------------------------------------');
    console.log('ADMIN ACCOUNT:');
    console.log('Name:     Prashanth');
    console.log('Email:    prashanth9392557522@gmail.com');
    console.log('Password: IplAdmin123');
    console.log('=========================================\n');

    return { adminUser, createdTeams, createdPlayers, auction };
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    throw err;
  }
};

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = runSeed;
