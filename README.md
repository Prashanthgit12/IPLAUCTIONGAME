# 🏏 AUCTIONX | Premium Real-Time Cricket Auction Platform

AUCTIONX is a broadcast-quality, full-stack **Cricket/IPL-style Real-Time Auction Platform** built with **React.js, Node.js, Express, MongoDB, and Socket.IO**. It features dark stadium visual aesthetics, authoritative server-side countdown timers, atomic bidding validation, franchise purse tracking, dramatic SOLD animations, and an API architecture decoupled for consumption by a future React Native / Expo mobile application.

---

## 📸 Key Features

1. **Broadcast-Grade Dark Sports UI**
   - Deep navy stadium backdrop (`#060b17`) with subtle ambient light flares.
   - Neon electric blue (`#00f0ff`), trophy gold (`#ffb300`), and cricket green accents.
   - Glassmorphism containers with `backdrop-filter: blur(14px)`.
   - Typography powered by Google Fonts **Outfit** (display & digits) and **Inter** (body & stats).
2. **Authoritative Real-Time Bidding Engine (Socket.IO)**
   - Backend-driven countdown timer (15 seconds default) with automatic tick synchronization.
   - **Anti-Snipe Protection**: Bids placed with under 5 seconds remaining automatically reset timer to 10 seconds.
   - Full atomic validation: purse balance, minimum increment slabs, squad cap (25 max), and overseas quota (8 max).
   - Zero client-side purse trust; all mutations executed atomically on server.
3. **Multi-Role System with Protected Routing**
   - **ADMIN**: Start, pause, resume, end auction, mark SOLD/UNSOLD, cycle players, modify rules, manage franchises & cricketers.
   - **TEAM_OWNER**: Access franchise war room, monitor real-time purse balance, and submit one-touch bids (+₹25L, +₹50L, +₹1Cr, +₹2Cr, Custom).
   - **VIEWER**: Spectator broadcast stream, real-time bid updates, squad rosters, and leaderboards.
4. **Dramatic SOLD Experience**
   - Full-screen celebration banner with golden stamp animation.
   - Synthesized Web Audio API fanfare (no external asset dependencies; works offline).
   - Particle confetti bursts and instant franchise purse deduction.
5. **Decoupled API Architecture for React Native**
   - RESTful JSON endpoints (`/api/*`) strictly independent of browser state.
   - Session-based JWT token exchange (no `localStorage` token storage).
   - Reusable by a future React Native / Expo mobile application.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM (v6), Axios, Bootstrap 5, Bootstrap Icons, Canvas Confetti, Web Audio API |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, JWT, bcryptjs, MongoDB Memory Server (Embedded Fallback) |
| **Database** | MongoDB (Standard connection or Embedded in-memory server) |

---

## 📂 Project Structure

```
IPL/
├── package.json                   # Root orchestrator scripts
├── README.md                      # Comprehensive documentation
├── backend/
│   ├── package.json
│   ├── .env                       # Environment configuration
│   ├── .env.example
│   ├── server.js                  # Express & Socket.IO HTTP server
│   ├── config/
│   │   ├── config.js              # Application constants & rules
│   │   └── db.js                  # Dual-mode MongoDB connection
│   ├── models/
│   │   ├── User.js                # User & role schema
│   │   ├── Team.js                # Franchise & purse schema
│   │   ├── Player.js              # Cricketer details & career stats
│   │   ├── Auction.js             # Auction state & rules
│   │   ├── Bid.js                 # Bid log entries
│   │   └── AuctionResult.js       # Historical sale records
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT authentication & role authorization
│   │   └── errorHandler.js        # Global error formatter
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── playerController.js
│   │   ├── teamController.js
│   │   ├── auctionController.js
│   │   ├── resultController.js
│   │   └── adminController.js
│   ├── routes/
│   ├── services/
│   │   └── auctionEngine.js       # Authoritative timer & state machine
│   ├── socket/
│   │   └── socketHandlers.js      # Socket.IO connection & event handlers
│   └── utils/
│       ├── seedData.js            # 10 franchises & 55 realistic cricketers
│       ├── seedRunner.js          # Standalone seeder script
│       └── verifyE2E.js           # Automated end-to-end test suite
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx               # App entry with stylesheets
    │   ├── App.jsx                # Router & Provider wrapper
    │   ├── styles/
    │   │   ├── theme.css          # Design system variables & color tokens
    │   │   ├── index.css          # Glassmorphism, broadcast cards, scrollbars
    │   │   └── animations.css     # LIVE pulse, timer glow, sold stamp
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Session-based auth without localStorage
    │   │   ├── AuctionSocketContext.jsx # Socket.IO state & sounds
    │   │   └── ToastContext.jsx   # Floating toast notifications
    │   ├── services/              # Axios API service layer
    │   ├── utils/
    │   │   ├── formatters.js      # Crores & Lakhs currency formatting
    │   │   └── soundEffects.js    # Synthesized Web Audio API sound FX
    │   ├── components/
    │   │   ├── common/            # Navbar, Footer, ProtectedRoute, Skeleton
    │   │   ├── auction/           # AuctionPlayerCard, CountdownTimer, BidControlPanel
    │   │   ├── cards/             # PlayerCard, TeamCard, StatCard
    │   │   └── admin/             # AdminSidebar
    │   └── pages/
    │       ├── Home.jsx           # Broadcast landing page
    │       ├── LiveAuction.jsx    # Centerpiece auction war room
    │       ├── Players.jsx        # Cricketer marketplace & search filters
    │       ├── PlayerDetails.jsx  # Complete career stats & bidding log
    │       ├── Teams.jsx          # Franchise directory
    │       ├── TeamDetails.jsx    # Squad breakdown by role & purse progress
    │       ├── Leaderboard.jsx    # Spenders ranking & top players
    │       ├── AuctionHistory.jsx # Completed sales audit log
    │       ├── Login.jsx          # Split-screen login with 1-click demo buttons
    │       ├── Register.jsx       # Public role registration
    │       ├── Profile.jsx        # User & franchise status
    │       └── admin/             # Dashboard, Live Control, Player & Team CRUD
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- **MongoDB**: (Optional) If you have a local MongoDB service or MongoDB Atlas cluster, specify it in `backend/.env`. If not, **AUCTIONX automatically boots an embedded in-memory MongoDB instance with zero configuration required!**

### 1. Installation

Install all dependencies in backend and frontend:

```bash
# In backend/
cd backend
npm install

# In frontend/
cd ../frontend
npm install
```

### 2. Environment Variables

Both `.env` files are pre-configured out of the box:

**`backend/.env`**:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auctionx
JWT_SECRET=auctionx_super_secure_jwt_secret_key_2026
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Running Locally

**Start Backend Server:**
```bash
cd backend
npm start
# Server boots on port 5000 and automatically seeds on initial run!
```

**Start Frontend Client (in a separate terminal):**
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🔑 Pre-Seeded Demo Accounts

The application seeds 10 realistic franchises, 55 cricketers across all categories, and dedicated demo accounts. You can sign in using 1-click buttons on the **Login Page**:

| Role | Email | Password | Details |
|---|---|---|---|
| **ADMIN** | `admin@auctionx.com` | `admin123` | Full access to auction controls, timer, player & team management |
| **TEAM OWNER** | `owner.mm@auctionx.com` | `password123` | Owner of **Mumbai Mariners** (Purse: ₹120 Cr) |
| **TEAM OWNER** | `owner.cc@auctionx.com` | `password123` | Owner of **Chennai Chargers** (Purse: ₹120 Cr) |
| **TEAM OWNER** | `owner.bb@auctionx.com` | `password123` | Owner of **Bengaluru Blazers** (Purse: ₹120 Cr) |
| **TEAM OWNER** | `owner.hh@auctionx.com` | `password123` | Owner of **Hyderabad Hawks** (Purse: ₹120 Cr) |
| **VIEWER** | `viewer@auctionx.com` | `password123` | Spectator with read-only broadcast access |

---

## 📡 Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `auction:join` | Client ➔ Server | — | Client joins `auction_room` and receives current state |
| `auction:leave` | Client ➔ Server | — | Client leaves auction room |
| `auction:sync` | Server ➔ Client | `{ auction, bids, remainingSeconds, isTimerRunning }` | Full auction snapshot on room entry |
| `auction:bid` | Client ➔ Server | `{ token, auctionId, teamId, amount }` | Team Owner places bid with JWT authentication |
| `auction:new-bid` | Server ➔ Client | `{ bid, auction, remainingSeconds }` | Broadcast to all clients upon bid acceptance |
| `auction:timer-update`| Server ➔ Client | `{ remainingSeconds, isTimerRunning }` | 1-second interval authoritative timer tick |
| `auction:player-sold` | Server ➔ Client | `{ player, team, soldPrice, result }` | Triggers fanfare, confetti, and purse deduction |
| `auction:player-unsold`| Server ➔ Client| `{ player, result }` | Emitted when player is marked unsold |
| `auction:next-player` | Server ➔ Client | `{ auction, player }` | Introduces next cricketer onto the block |
| `auction:started` | Server ➔ Client | `{ auction }` | Emitted when admin initiates the round |
| `auction:paused` | Server ➔ Client | `{ auction, remainingSeconds }` | Emitted when admin pauses the countdown |
| `auction:error` | Server ➔ Client | `{ message }` | Direct error message back to emitting client |

---

## 🌐 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new `TEAM_OWNER` or `VIEWER` (Admin cannot register publicly).
- `POST /api/auth/login`: Authenticate and receive session JWT.
- `GET /api/auth/me`: Fetch authenticated user profile and assigned team data.

### Cricketers (`/api/players`)
- `GET /api/players`: List players with search, role, category, status, and price filters.
- `GET /api/players/:id`: Get single player profile, career stats, and bid record.
- `POST /api/players`: (Admin) Add new cricketer.
- `PUT /api/players/:id`: (Admin) Update cricketer details.
- `DELETE /api/players/:id`: (Admin) Remove cricketer.

### Franchises (`/api/teams`)
- `GET /api/teams`: List all franchises with squad counts and purse balances.
- `GET /api/teams/:id`: Get full squad categorized into Batters, Bowlers, All-rounders, and Keepers.
- `POST /api/teams`: (Admin) Create franchise.
- `PUT /api/teams/:id`: (Admin) Update franchise.
- `DELETE /api/teams/:id`: (Admin) Delete franchise.

### Live Auction (`/api/auctions`)
- `GET /api/auctions/active`: Retrieve current live auction state and candidate on block.
- `POST /api/auctions/:id/start`: (Admin) Start bidding round.
- `POST /api/auctions/:id/pause`: (Admin) Pause timer.
- `POST /api/auctions/:id/resume`: (Admin) Resume timer.
- `POST /api/auctions/:id/sold`: (Admin) Finalize sale to current highest bidder.
- `POST /api/auctions/:id/unsold`: (Admin) Mark candidate unsold.
- `POST /api/auctions/:id/next-player`: (Admin) Advance to next available cricketer.
- `POST /api/auctions/:id/bid`: (Team Owner) Place bid via REST fallback.
- `GET /api/auctions/:id/bids`: View bid history for auction session.

### History & Leaderboard (`/api/results`)
- `GET /api/results`: Complete audit log of all auctioned players.
- `GET /api/results/leaderboard`: Franchise spending standings and most expensive players.

---

## 📱 Future React Native Architecture

The backend was engineered to be completely decoupled from browser-specific dependencies. When creating the mobile application:

1. Use **Expo** or React Native CLI:
   ```bash
   npx create-expo-app mobile-app
   ```
2. Consume the identical REST endpoints using `axios` with an auth token stored in `expo-secure-store`.
3. Connect to the identical Socket.IO server (`http://<SERVER_IP>:5000`) using `socket.io-client`.
4. The exact same data models, bid validation rules, authoritative timers, and anti-snipe logic will power the mobile client seamlessly.

---

## 🧪 Automated Verification Suite

To run the automated 13-step end-to-end verification suite:

```bash
cd backend
node utils/verifyE2E.js
```
#   I P L A U C T I O N G A M E  
 