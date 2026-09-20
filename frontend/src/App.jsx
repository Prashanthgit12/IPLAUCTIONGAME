import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AuctionSocketProvider } from './context/AuctionSocketContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Pages
import Home from './pages/Home';
import LiveAuction from './pages/LiveAuction';
import Players from './pages/Players';
import PlayerDetails from './pages/PlayerDetails';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Leaderboard from './pages/Leaderboard';
import AuctionHistory from './pages/AuctionHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Trades from './pages/Trades';
import RoomLobby from './pages/RoomLobby';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAuctionControl from './pages/admin/AdminAuctionControl';
import AdminPlayerManager from './pages/admin/AdminPlayerManager';
import AdminTeamManager from './pages/admin/AdminTeamManager';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AuthProvider>
          <AuctionSocketProvider>
            <WishlistProvider>
              <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
              <Navbar />
              <main className="flex-grow-1">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/live" element={<LiveAuction />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/players/:id" element={<PlayerDetails />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/teams/:id" element={<TeamDetails />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/history" element={<AuctionHistory />} />
                  <Route path="/trades" element={<Trades />} />
                  <Route path="/room/:roomCode" element={<RoomLobby />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Authenticated User Pages */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Pages */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RoleRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/auction-control"
                    element={
                      <RoleRoute allowedRoles={['ADMIN']}>
                        <AdminAuctionControl />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/players"
                    element={
                      <RoleRoute allowedRoles={['ADMIN']}>
                        <AdminPlayerManager />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/teams"
                    element={
                      <RoleRoute allowedRoles={['ADMIN']}>
                        <AdminTeamManager />
                      </RoleRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            </WishlistProvider>
          </AuctionSocketProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
