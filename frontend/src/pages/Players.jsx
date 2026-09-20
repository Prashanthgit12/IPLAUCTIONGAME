import React, { useState, useEffect } from 'react';
import { playerService } from '../services/playerService';
import PlayerCard from '../components/cards/PlayerCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import CustomPlayerModal from '../components/players/CustomPlayerModal';
import { useAuth } from '../context/AuthContext';

const AUCTION_SETS = [
  { id: 'ALL', label: 'All Sets' },
  { id: 'M1', label: 'M1: Marquee 1' },
  { id: 'M2', label: 'M2: Marquee 2' },
  { id: 'BA1', label: 'BA1: Capped Batters 1' },
  { id: 'BA2', label: 'BA2: Capped Batters 2' },
  { id: 'WK1', label: 'WK1: Capped Keepers 1' },
  { id: 'WK2', label: 'WK2: Capped Keepers 2' },
  { id: 'AL1', label: 'AL1: Capped All-Rounders 1' },
  { id: 'AL2', label: 'AL2: Capped All-Rounders 2' },
  { id: 'FA1', label: 'FA1: Capped Pacers 1' },
  { id: 'FA2', label: 'FA2: Capped Pacers 2' },
  { id: 'SP1', label: 'SP1: Capped Spinners 1' },
  { id: 'SP2', label: 'SP2: Capped Spinners 2' },
  { id: 'UBA1', label: 'UBA1: Uncapped Batters' },
  { id: 'UAL1', label: 'UAL1: Uncapped All-Rounders' },
  { id: 'UWK1', label: 'UWK1: Uncapped Keepers' },
  { id: 'UFA1', label: 'UFA1: Uncapped Pacers' },
  { id: 'USP1', label: 'USP1: Uncapped Spinners' }
];

const Players = () => {
  const { isAdmin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('price_desc');
  const [isCappedFilter, setIsCappedFilter] = useState('ALL'); // 'ALL', 'true', 'false'
  const [auctionSetFilter, setAuctionSetFilter] = useState('ALL');
  const [bowlingTypeFilter, setBowlingTypeFilter] = useState('ALL');

  // Custom Player Modal
  const [showCustomModal, setShowCustomModal] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await playerService.getPlayers({
        search,
        role: role === 'BOWLER_PACE' || role === 'BOWLER_SPIN' ? 'BOWLER' : role,
        bowlingType: role === 'BOWLER_PACE' ? 'PACE' : role === 'BOWLER_SPIN' ? 'SPIN' : bowlingTypeFilter,
        isCapped: isCappedFilter === 'ALL' ? undefined : isCappedFilter === 'true',
        auctionSet: auctionSetFilter === 'ALL' ? undefined : auctionSetFilter,
        status,
        sort
      });
      if (res?.data) {
        setPlayers(res.data);
      }
    } catch (err) {
      console.error('Failed to load players:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPlayers, 300);
    return () => clearTimeout(timer);
  }, [search, role, status, sort, isCappedFilter, auctionSetFilter, bowlingTypeFilter]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        {/* Header Title & Action */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 px-2.5 py-1">
                <i className="bi bi-shield-check me-1"></i> OFFICIAL 2026 IPL REGISTER
              </span>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Real Players • Authentic Career Stats • Verified Headshots
              </span>
            </div>
            <h2 className="text-white font-display fw-bold mb-0">PLAYERS MARKETPLACE</h2>
          </div>
          <div className="d-flex align-items-center gap-2">
            {isAdmin && (
              <button
                className="btn btn-outline-info d-flex align-items-center gap-2 font-display fw-bold px-3 py-2"
                onClick={() => setShowCustomModal(true)}
              >
                <i className="bi bi-person-plus-fill"></i>
                Add Custom Cricketer
              </button>
            )}
            <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Showing <strong className="text-white">{players.length}</strong> Cricketers
            </div>
          </div>
        </div>

        {/* Primary Segment Tabs (Capped vs Uncapped) */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className={`btn px-3 py-2 font-display fw-bold ${isCappedFilter === 'ALL' ? 'btn-info' : 'btn-dark'}`}
            onClick={() => {
              setIsCappedFilter('ALL');
              setAuctionSetFilter('ALL');
            }}
          >
            All Players ({players.length})
          </button>
          <button
            className={`btn px-3 py-2 font-display fw-bold ${isCappedFilter === 'true' ? 'btn-primary' : 'btn-dark'}`}
            onClick={() => {
              setIsCappedFilter('true');
              setAuctionSetFilter('ALL');
            }}
          >
            ⭐ Capped Stars (₹1 Cr - ₹2 Cr)
          </button>
          <button
            className={`btn px-3 py-2 font-display fw-bold ${isCappedFilter === 'false' ? 'btn-warning text-dark' : 'btn-dark'}`}
            onClick={() => {
              setIsCappedFilter('false');
              setAuctionSetFilter('ALL');
            }}
          >
            ⚡ Uncapped Talents (₹20 L - ₹50 L)
          </button>
        </div>

        {/* Auction Set Pills Bar */}
        <div className="glass-card p-2.5 mb-4 d-flex gap-2 overflow-x-auto align-items-center">
          <span className="text-secondary small text-nowrap fw-bold ps-2 pe-1">
            <i className="bi bi-funnel me-1"></i> AUCTION SETS:
          </span>
          {AUCTION_SETS.map((s) => (
            <button
              key={s.id}
              className={`btn btn-sm text-nowrap py-1 px-2.5 rounded-pill font-display ${
                auctionSetFilter === s.id ? 'btn-info' : 'btn-outline-secondary text-white'
              }`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => setAuctionSetFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Glass Bar */}
        <div className="glass-card p-3 p-md-4 mb-4">
          <div className="row g-3">
            {/* Search Input */}
            <div className="col-lg-4 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-dark"
                  placeholder="Search player name or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Role / Bowling Type Filter */}
            <div className="col-lg-3 col-md-3 col-6">
              <select
                className="form-select form-select-dark"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="BATTER">🏏 Specialist Batters</option>
                <option value="BOWLER_PACE">⚡ Fast Bowlers (Pace)</option>
                <option value="BOWLER_SPIN">🌪️ Spin Bowlers (Spin)</option>
                <option value="ALL_ROUNDER">👑 All-Rounders</option>
                <option value="WICKET_KEEPER">🧤 Wicket-Keepers</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-lg-2 col-md-3 col-6">
              <select
                className="form-select form-select-dark"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="IN_AUCTION">On Block</option>
                <option value="SOLD">Sold</option>
                <option value="UNSOLD">Unsold</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="col-lg-3 col-md-6 col-12">
              <select
                className="form-select form-select-dark"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="price_desc">Base Price: High to Low</option>
                <option value="price_asc">Base Price: Low to High</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        {loading ? (
          <CardSkeleton count={8} />
        ) : players.length === 0 ? (
          <EmptyState
            icon="bi-person-x"
            title="No cricketers found"
            description="Try adjusting your search query or set filter selections."
            actionText="Reset All Filters"
            onActionClick={() => {
              setSearch('');
              setRole('ALL');
              setStatus('ALL');
              setIsCappedFilter('ALL');
              setAuctionSetFilter('ALL');
              setBowlingTypeFilter('ALL');
            }}
          />
        ) : (
          <div className="row g-4">
            {players.map((player) => (
              <div key={player._id} className="col-lg-3 col-md-6 col-12">
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Player Creator Modal (Admin Only) */}
      {isAdmin && showCustomModal && (
        <CustomPlayerModal
          onClose={() => setShowCustomModal(false)}
          onPlayerCreated={fetchPlayers}
        />
      )}
    </div>
  );
};

export default Players;
