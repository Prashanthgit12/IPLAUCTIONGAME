const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config/config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const roomRoutes = require('./routes/roomRoutes');

// Socket setup
const setupSocketHandlers = require('./socket/socketHandlers');
const auctionEngine = require('./services/auctionEngine');
const User = require('./models/User');
const runSeed = require('./utils/seedRunner');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Configure CORS
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AUCTIONX API server is running normally',
    timestamp: new Date().toISOString()
  });
});



// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.io handlers
setupSocketHandlers(io);

// Global Error Handler
app.use(errorHandler);

// Start Server & Auto-seed if empty
const startServer = async () => {
  try {
    await connectDB();

    // Check if seeded
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seed...');
      await runSeed();
    }

    server.listen(config.PORT, async () => {
      console.log(`[Server] AUCTIONX backend running on port ${config.PORT}`);
      console.log(`[Server] REST API: http://localhost:${config.PORT}/api`);
      console.log(`[Server] Socket.IO ready`);

      // Initialize active live auction (waiting for human interaction)
      try {
        const activeAuction = await auctionEngine.getOrCreateActiveAuction();
        if (activeAuction) {
          console.log(`[Server] Active auction ready at starting block: ${activeAuction.name} (Status: ${activeAuction.status})`);
        }
      } catch (err) {
        console.error('[Server] Failed to auto-initialize active auction:', err.message);
      }
    });
  } catch (err) {
    console.error('[Server] Startup failure:', err);
    process.exit(1);
  }
};

startServer();
