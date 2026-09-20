import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import TeamCard from '../components/cards/TeamCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await teamService.getTeams();
        if (res) setTeams(res);
      } catch (err) {
        console.error('Failed to load teams:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.shortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <span className="text-info font-display fw-bold" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              OFFICIAL FRANCHISES
            </span>
            <h2 className="text-white font-display fw-bold mb-0">COMPETING TEAMS</h2>
          </div>

          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control form-control-dark"
              placeholder="Search team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : filteredTeams.length === 0 ? (
          <div className="glass-card text-center p-5">
            <h4 className="text-white">No teams match "{search}"</h4>
          </div>
        ) : (
          <div className="row g-4">
            {filteredTeams.map((team) => (
              <div key={team._id} className="col-lg-4 col-md-6 col-12">
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
