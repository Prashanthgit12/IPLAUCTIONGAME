import React, { useState, useEffect } from 'react';
import { auctionService } from '../../services/auctionService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/cards/StatCard';
import TeamLogo from '../../components/common/TeamLogo';
import { formatPurse, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const { addToast } = useToast();

  const loadStats = async () => {
    try {
      const res = await auctionService.getAdminStats();
      setStats(res);
    } catch (err) {
      console.error('Failed to load admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const metrics = stats?.metrics || {};
  const registeredUsers = stats?.registeredUsers || [];
  const spendingByTeam = stats?.spendingByTeam || [];
  const playersByRole = stats?.playersByRole || {};
  const recentBids = stats?.recentBids || [];

  const filteredUsers = registeredUsers.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchTeam = u.team?.name?.toLowerCase().includes(q) || u.team?.shortName?.toLowerCase().includes(q);
      return matchName || matchEmail || matchTeam;
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <AdminSidebar />
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <span className="text-warning font-display fw-bold" style={{ fontSize: '0.85rem' }}>
                  MANAGEMENT PORTAL
                </span>
                <h2 className="text-white font-display fw-bold mb-0">ADMIN DASHBOARD</h2>
              </div>

              <button
                onClick={loadStats}
                disabled={loading}
                className="btn btn-premium-glass btn-sm"
                title="Refresh Statistics"
              >
                <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
                Refresh
              </button>
            </div>

            {/* Top Metrics Row - 5 Cards */}
            <div className="row g-3 mb-4">
              {/* Card 1: Registered Users */}
              <div className="col-lg col-md-4 col-6">
                <StatCard
                  title="Registered Users"
                  value={metrics.totalUsers || 0}
                  subtitle={`${metrics.ownersCount || 0} Owners • ${metrics.spectatorsCount || 0} Spectators`}
                  icon="bi-person-badge-fill"
                  accentColor="#00f0ff"
                />
              </div>

              {/* Card 2: Total Players */}
              <div className="col-lg col-md-4 col-6">
                <StatCard
                  title="Total Players"
                  value={metrics.totalPlayers || 0}
                  subtitle={`Available: ${metrics.availablePlayers || 0}`}
                  icon="bi-people"
                  accentColor="#3d5afe"
                />
              </div>

              {/* Card 3: Players Sold */}
              <div className="col-lg col-md-4 col-6">
                <StatCard
                  title="Players Sold"
                  value={metrics.soldPlayers || 0}
                  subtitle={`Unsold: ${metrics.unsoldPlayers || 0}`}
                  icon="bi-check2-circle"
                  accentColor="#00e676"
                />
              </div>

              {/* Card 4: Total Spent */}
              <div className="col-lg col-md-4 col-6">
                <StatCard
                  title="Total Spent"
                  value={formatPurse(metrics.totalMoneySpent || 0)}
                  subtitle={`Avg: ${formatPurse(metrics.avgPlayerPrice || 0)}`}
                  icon="bi-cash-coin"
                  accentColor="#ffb300"
                />
              </div>

              {/* Card 5: Teams Active */}
              <div className="col-lg col-md-4 col-6">
                <StatCard
                  title="Teams Active"
                  value={metrics.totalTeams || 0}
                  subtitle={`${metrics.totalBids || 0} Total Bids`}
                  icon="bi-shield-check"
                  accentColor="#e040fb"
                />
              </div>
            </div>

            {/* Registered Users Section */}
            <div className="glass-card p-4 mb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-5">👥</span>
                  <div>
                    <h5 className="text-white font-display fw-bold mb-0">REGISTERED TOURNAMENT USERS</h5>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                      All registered participants, team owners, and spectators ({registeredUsers.length} total)
                    </span>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('ALL')}
                    className={`btn ${userRoleFilter === 'ALL' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
                  >
                    All ({registeredUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('TEAM_OWNER')}
                    className={`btn ${userRoleFilter === 'TEAM_OWNER' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
                  >
                    Owners ({metrics.ownersCount || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('SPECTATOR')}
                    className={`btn ${userRoleFilter === 'SPECTATOR' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
                  >
                    Spectators ({metrics.spectatorsCount || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('ADMIN')}
                    className={`btn ${userRoleFilter === 'ADMIN' ? 'btn-premium-accent' : 'btn-outline-secondary'}`}
                  >
                    Admin ({metrics.adminsCount || 0})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Search by user name, email, or franchise..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setUserSearch('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-info" role="status"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-muted text-center py-4 glass-panel rounded-3">
                  No users found matching current filters.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark-custom align-middle mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Assigned Franchise</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const isUserAdmin = u.role === 'ADMIN';
                        const isOwner = u.role === 'TEAM_OWNER';

                        return (
                          <tr key={u._id}>
                            {/* User Name & Avatar */}
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isUserAdmin
                                      ? 'linear-gradient(135deg, #ff1744 0%, #d50000 100%)'
                                      : isOwner
                                      ? 'linear-gradient(135deg, #ffb300 0%, #ff6f00 100%)'
                                      : 'linear-gradient(135deg, #00f0ff 0%, #0091ea 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: isUserAdmin ? '#fff' : '#000',
                                    fontSize: '0.82rem',
                                    flexShrink: 0
                                  }}
                                >
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div className="text-white fw-bold">{u.name}</div>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="text-white-50" style={{ fontSize: '0.88rem' }}>
                              {u.email}
                            </td>

                            {/* Role Badge */}
                            <td>
                              <span
                                className="badge font-display fw-bold"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '4px 8px',
                                  background: isUserAdmin
                                    ? 'rgba(255, 23, 68, 0.2)'
                                    : isOwner
                                    ? 'rgba(255, 179, 0, 0.2)'
                                    : 'rgba(0, 240, 255, 0.2)',
                                  color: isUserAdmin ? '#ff5252' : isOwner ? '#ffb300' : '#00f0ff',
                                  border: `1px solid ${
                                    isUserAdmin
                                      ? 'rgba(255, 23, 68, 0.4)'
                                      : isOwner
                                      ? 'rgba(255, 179, 0, 0.4)'
                                      : 'rgba(0, 240, 255, 0.4)'
                                  }`
                                }}
                              >
                                {isUserAdmin ? '👑 ADMIN' : isOwner ? '🏏 FRANCHISE OWNER' : '👁️ SPECTATOR'}
                              </span>
                            </td>

                            {/* Assigned Franchise */}
                            <td>
                              {u.team ? (
                                <div className="d-flex align-items-center gap-2">
                                  <TeamLogo team={u.team} size={24} />
                                  <span className="text-white fw-semibold" style={{ fontSize: '0.88rem' }}>
                                    {u.team.name}
                                  </span>
                                  <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                                    {u.team.shortName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                                  {isUserAdmin ? 'Tournament Control' : 'No Team (Spectator)'}
                                </span>
                              )}
                            </td>

                            {/* Registration Date */}
                            <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                              {u.createdAt ? formatDate(u.createdAt) : 'Initial Seed'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Middle Section: Spending by Team & Role Distribution */}
            <div className="row g-4 mb-4">
              {/* Franchise Spending Progress */}
              <div className="col-lg-7">
                <div className="glass-card p-4 h-100">
                  <h5 className="text-white font-display fw-bold mb-3">FRANCHISE PURSE UTILIZATION</h5>
                  <div className="d-flex flex-column gap-3">
                    {spendingByTeam.map((team, idx) => {
                      const total = team.spent + team.remaining || 1200000000;
                      const pct = Math.min(100, Math.round((team.spent / total) * 100));

                      return (
                        <div key={idx}>
                          <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.85rem' }}>
                            <span className="text-white fw-semibold">{team.name} ({team.shortName})</span>
                            <span className="text-info font-display">{formatPurse(team.spent)} spent</span>
                          </div>
                          <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${pct}%`, background: team.primaryColor || '#00f0ff' }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="col-lg-5">
                <div className="glass-card p-4 h-100">
                  <h5 className="text-white font-display fw-bold mb-3">PLAYERS BY ROLE</h5>
                  <div className="d-flex flex-column gap-3">
                    <div className="glass-panel p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge badge-batter">BATTERS</span>
                      </div>
                      <span className="text-white fw-bold fs-5 font-display">{playersByRole.batters || 0}</span>
                    </div>

                    <div className="glass-panel p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge badge-bowler">BOWLERS</span>
                      </div>
                      <span className="text-white fw-bold fs-5 font-display">{playersByRole.bowlers || 0}</span>
                    </div>

                    <div className="glass-panel p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge badge-allrounder">ALL-ROUNDERS</span>
                      </div>
                      <span className="text-white fw-bold fs-5 font-display">{playersByRole.allRounders || 0}</span>
                    </div>

                    <div className="glass-panel p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge badge-keeper">WICKET-KEEPERS</span>
                      </div>
                      <span className="text-white fw-bold fs-5 font-display">{playersByRole.wicketKeepers || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bids Feed */}
            <div className="glass-card p-4">
              <h5 className="text-white font-display fw-bold mb-3">RECENT AUCTION ACTIVITY</h5>
              {recentBids.length === 0 ? (
                <div className="text-muted text-center py-4">No recent bids submitted.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark-custom">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Team</th>
                        <th>Amount</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBids.map((b) => (
                        <tr key={b._id}>
                          <td className="text-white fw-semibold">{b.player?.name}</td>
                          <td className="text-info">{b.team?.name}</td>
                          <td className="text-success font-display fw-bold">{formatPurse(b.amount)}</td>
                          <td className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(b.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
