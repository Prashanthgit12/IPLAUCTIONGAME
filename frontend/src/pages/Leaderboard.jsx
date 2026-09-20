import React, { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import { formatPurse, getRoleBadgeClass, getRoleName } from '../utils/formatters';
import StatCard from '../components/cards/StatCard';
import TeamLogo from '../components/common/TeamLogo';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

const Leaderboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await auctionService.getLeaderboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load leaderboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
        <div className="container-xl">
          <TableSkeleton rows={8} />
        </div>
      </div>
    );
  }

  const { teamLeaderboard = [], topPlayers = [], highlights = {} } = data || {};

  // Compute MVP Honours
  const goldenGavelPlayer = topPlayers.length > 0 ? topPlayers[0] : null;

  // Steal of the auction: player sold at lowest price relative to their base or rating
  const stealPlayer =
    topPlayers.length > 0
      ? [...topPlayers].sort((a, b) => (a.soldPrice || 0) - (b.soldPrice || 0))[0]
      : null;

  // Master strategist team: franchise with highest players bought
  const masterStrategistTeam =
    teamLeaderboard.length > 0
      ? [...teamLeaderboard].sort((a, b) => (b.playersBought || 0) - (a.playersBought || 0))[0]
      : null;

  // Purse perfection team: franchise that maintained best purse balance while acquiring players
  const pursePerfectionTeam =
    teamLeaderboard.length > 0
      ? [...teamLeaderboard]
          .filter((t) => t.playersBought > 0)
          .sort((a, b) => b.remainingPurse - a.remainingPurse)[0] || teamLeaderboard[0]
      : null;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '70px' }}>
      <div className="container-xl">
        {/* Header */}
        <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <span className="text-info font-display fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              IPL MEGA AUCTION HONOURS
            </span>
            <h2 className="text-white font-display fw-bold mb-0" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
              STANDINGS & MVP GALLERY
            </h2>
          </div>
          <span className="badge bg-dark border border-secondary text-secondary px-3 py-2">
            Updated in Real-Time
          </span>
        </div>

        {/* Top Highlight Cards */}
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <StatCard
              title="Top Spending Team"
              value={highlights?.highestSpendingTeam?.name || 'None'}
              subtitle={`Total Spent: ${formatPurse(highlights?.highestSpendingTeam?.totalSpent || 0)}`}
              icon="bi-currency-rupee"
              accentColor="#ffb300"
            />
          </div>

          <div className="col-lg-4 col-md-6">
            <StatCard
              title="Most Expensive Cricketer"
              value={topPlayers[0]?.name || 'None'}
              subtitle={
                topPlayers[0]?.soldPrice
                  ? `Sold For: ${formatPurse(topPlayers[0].soldPrice)} (${topPlayers[0]?.soldTo?.name || 'Team'})`
                  : 'Awaiting marquee bids'
              }
              icon="bi-trophy-fill"
              accentColor="#00f0ff"
            />
          </div>

          <div className="col-lg-4 col-md-6">
            <StatCard
              title="Total Sold Players"
              value={topPlayers.length}
              subtitle="Cricketers acquired across franchises"
              icon="bi-people-fill"
              accentColor="#00e676"
            />
          </div>
        </div>

        {/* Auction Honours & MVP Badges Gallery */}
        <div className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="fs-4">🏆</span>
            <h4 className="text-white font-display fw-bold mb-0">AUCTION HONOURS & AWARDS</h4>
          </div>

          <div className="row g-3">
            {/* 1. Golden Gavel */}
            <div className="col-lg-3 col-md-6 col-12">
              <div
                className="glass-card p-3 h-100 position-relative overflow-hidden"
                style={{
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.08) 0%, rgba(10, 16, 35, 0.7) 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-warning text-dark fw-bold font-display" style={{ fontSize: '0.72rem' }}>
                    🔨 GOLDEN GAVEL
                  </span>
                </div>
                <div className="text-secondary small mb-2">Highest Bid Superstar</div>
                {goldenGavelPlayer ? (
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        goldenGavelPlayer.image ||
                        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'
                      }
                      alt={goldenGavelPlayer.name}
                      style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div className="overflow-hidden">
                      <h6 className="text-white fw-bold mb-0 text-truncate">{goldenGavelPlayer.name}</h6>
                      <div className="text-warning font-display fw-bold" style={{ fontSize: '0.92rem' }}>
                        {formatPurse(goldenGavelPlayer.soldPrice)}
                      </div>
                      <span className="text-muted small">{goldenGavelPlayer.soldTo?.shortName || 'Franchise'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted small py-2">Awaiting first marquee signing</div>
                )}
              </div>
            </div>

            {/* 2. Steal of the Auction */}
            <div className="col-lg-3 col-md-6 col-12">
              <div
                className="glass-card p-3 h-100 position-relative overflow-hidden"
                style={{
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  background: 'linear-gradient(145deg, rgba(0, 240, 255, 0.08) 0%, rgba(10, 16, 35, 0.7) 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-info text-dark fw-bold font-display" style={{ fontSize: '0.72rem' }}>
                    💎 VALUE STEAL
                  </span>
                </div>
                <div className="text-secondary small mb-2">Smartest Value Signing</div>
                {stealPlayer ? (
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        stealPlayer.image ||
                        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'
                      }
                      alt={stealPlayer.name}
                      style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div className="overflow-hidden">
                      <h6 className="text-white fw-bold mb-0 text-truncate">{stealPlayer.name}</h6>
                      <div className="text-info font-display fw-bold" style={{ fontSize: '0.92rem' }}>
                        {formatPurse(stealPlayer.soldPrice)}
                      </div>
                      <span className="text-muted small">{stealPlayer.soldTo?.shortName || 'Franchise'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted small py-2">Awaiting value signing</div>
                )}
              </div>
            </div>

            {/* 3. Master Strategist */}
            <div className="col-lg-3 col-md-6 col-12">
              <div
                className="glass-card p-3 h-100 position-relative overflow-hidden"
                style={{
                  border: '1px solid rgba(0, 230, 118, 0.4)',
                  background: 'linear-gradient(145deg, rgba(0, 230, 118, 0.08) 0%, rgba(10, 16, 35, 0.7) 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-success text-white fw-bold font-display" style={{ fontSize: '0.72rem' }}>
                    🧠 MASTER STRATEGIST
                  </span>
                </div>
                <div className="text-secondary small mb-2">Most Active Franchise</div>
                {masterStrategistTeam && masterStrategistTeam.playersBought > 0 ? (
                  <div className="d-flex align-items-center gap-3">
                    <TeamLogo team={masterStrategistTeam} size={42} />
                    <div className="overflow-hidden">
                      <h6 className="text-white fw-bold mb-0 text-truncate">{masterStrategistTeam.name}</h6>
                      <div className="text-success font-display fw-bold" style={{ fontSize: '0.92rem' }}>
                        {masterStrategistTeam.playersBought} Signings
                      </div>
                      <span className="text-muted small">{formatPurse(masterStrategistTeam.totalSpent)} spent</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted small py-2">Awaiting team acquisitions</div>
                )}
              </div>
            </div>

            {/* 4. Purse Perfection */}
            <div className="col-lg-3 col-md-6 col-12">
              <div
                className="glass-card p-3 h-100 position-relative overflow-hidden"
                style={{
                  border: '1px solid rgba(235, 77, 75, 0.4)',
                  background: 'linear-gradient(145deg, rgba(235, 77, 75, 0.08) 0%, rgba(10, 16, 35, 0.7) 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-danger text-white fw-bold font-display" style={{ fontSize: '0.72rem' }}>
                    💰 PURSE PERFECTION
                  </span>
                </div>
                <div className="text-secondary small mb-2">Highest Retained Capital</div>
                {pursePerfectionTeam ? (
                  <div className="d-flex align-items-center gap-3">
                    <TeamLogo team={pursePerfectionTeam} size={42} />
                    <div className="overflow-hidden">
                      <h6 className="text-white fw-bold mb-0 text-truncate">{pursePerfectionTeam.name}</h6>
                      <div className="text-white font-display fw-bold" style={{ fontSize: '0.92rem' }}>
                        {formatPurse(pursePerfectionTeam.remainingPurse)}
                      </div>
                      <span className="text-muted small">{pursePerfectionTeam.playersBought} players</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted small py-2">Awaiting budget data</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Spending Table */}
        <div className="glass-card p-4 mb-5">
          <h4 className="text-white font-display fw-bold mb-3">FRANCHISE PURSE & SQUAD STATUS</h4>
          <div className="table-responsive">
            <table className="table table-dark-custom">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Franchise</th>
                  <th>Total Spent</th>
                  <th>Remaining Purse</th>
                  <th>Players Bought</th>
                  <th>Avg Price / Player</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaderboard.map((team, idx) => (
                  <tr key={team._id}>
                    <td>
                      <span className="fw-bold text-secondary">#{idx + 1}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <TeamLogo team={team} size={26} />
                        <span className="text-white fw-bold">{team.name}</span>
                        <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                          {team.shortName}
                        </span>
                      </div>
                    </td>
                    <td className="text-warning fw-bold font-display">{formatPurse(team.totalSpent)}</td>
                    <td className="text-success fw-bold font-display">{formatPurse(team.remainingPurse)}</td>
                    <td className="text-white">{team.playersBought}</td>
                    <td className="text-info font-display">{formatPurse(team.avgPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Most Expensive Players Table */}
        <div className="glass-card p-4">
          <h4 className="text-white font-display fw-bold mb-3">MOST EXPENSIVE CRICKETERS (TOP 10)</h4>
          {topPlayers.length === 0 ? (
            <div className="text-center py-4 text-muted">No players have been marked sold yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark-custom">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Winning Team</th>
                    <th>Sold Price</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((player, idx) => (
                    <tr key={player._id}>
                      <td>
                        <span className="fw-bold text-secondary">#{idx + 1}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              player.image ||
                              'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'
                            }
                            alt={player.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span className="text-white fw-bold">{player.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(player.role)}`}>
                          {getRoleName(player.role)}
                        </span>
                      </td>
                      <td className="text-white">{player.soldTo?.name || 'N/A'}</td>
                      <td className="text-success font-display fw-bold fs-5">
                        {formatPurse(player.soldPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
