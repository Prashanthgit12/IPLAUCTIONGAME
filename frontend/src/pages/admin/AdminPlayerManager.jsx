import React, { useState, useEffect } from 'react';
import { playerService } from '../../services/playerService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { formatPurse, getStatusBadge } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const AdminPlayerManager = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    isOverseas: false,
    role: 'BATTER',
    category: 'CAPPED',
    age: 25,
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    basePrice: 20000000,
    image: '',
    status: 'AVAILABLE'
  });

  const loadPlayers = async () => {
    try {
      const res = await playerService.getPlayers({ search });
      if (res?.data) setPlayers(res.data);
    } catch (err) {
      console.error('Failed to load players:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData({
      name: '',
      country: 'India',
      isOverseas: false,
      role: 'BATTER',
      category: 'CAPPED',
      age: 25,
      battingStyle: 'Right-hand bat',
      bowlingStyle: 'Right-arm medium',
      basePrice: 20000000,
      image: '',
      status: 'AVAILABLE'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      country: player.country,
      isOverseas: player.isOverseas,
      role: player.role,
      category: player.category,
      age: player.age || 25,
      battingStyle: player.battingStyle || 'Right-hand bat',
      bowlingStyle: player.bowlingStyle || 'Right-arm medium',
      basePrice: player.basePrice,
      image: player.image || '',
      status: player.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await playerService.deletePlayer(id);
      addToast(`Deleted ${name}`, 'success');
      loadPlayers();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await playerService.updatePlayer(editingPlayer._id, formData);
        addToast(`Updated ${formData.name}`, 'success');
      } else {
        await playerService.createPlayer(formData);
        addToast(`Created player ${formData.name}`, 'success');
      }
      setShowModal(false);
      loadPlayers();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '95px', paddingBottom: '60px' }}>
      <div className="container-xl">
        <div className="row g-4">
          <div className="col-lg-3">
            <AdminSidebar />
          </div>

          <div className="col-lg-9">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <span className="text-info font-display fw-bold" style={{ fontSize: '0.85rem' }}>
                  PLAYER REGISTRY
                </span>
                <h2 className="text-white font-display fw-bold mb-0">MANAGE PLAYERS</h2>
              </div>

              <button onClick={handleOpenAdd} className="btn btn-premium-accent">
                <i className="bi bi-person-plus-fill me-1"></i> Add New Player
              </button>
            </div>

            {/* Filter */}
            <div className="glass-card p-3 mb-4">
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="Search players by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="glass-card p-4">
              <div className="table-responsive">
                <table className="table table-dark-custom">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Role</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => {
                      const statusInfo = getStatusBadge(p.status);

                      return (
                        <tr key={p._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={p.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80'}
                                alt={p.name}
                                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <div className="text-white fw-bold">{p.name}</div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                  {p.country} {p.isOverseas && '✈️'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-batter">{p.role}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{p.category}</span>
                          </td>
                          <td className="font-display fw-bold text-info">
                            {formatPurse(p.basePrice)}
                          </td>
                          <td>
                            <span className={`badge-status ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="btn btn-sm btn-premium-glass py-1 px-2"
                                title="Edit Player"
                              >
                                <i className="bi bi-pencil-square text-info"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(p._id, p.name)}
                                className="btn btn-sm btn-premium-glass py-1 px-2 text-danger"
                                title="Delete Player"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-content-custom p-4 p-md-5 overflow-auto"
            style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
              <h4 className="text-white font-display fw-bold mb-0">
                {editingPlayer ? 'EDIT CRICKETER' : 'ADD NEW CRICKETER'}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm text-secondary"
                style={{ background: 'none', border: 'none', fontSize: '1.4rem' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Player Name</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-dark"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-5">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Age</label>
                  <input
                    type="number"
                    className="form-control form-control-dark"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Country</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-dark"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-center mt-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isOverseasCheck"
                      checked={formData.isOverseas}
                      onChange={(e) => setFormData({ ...formData, isOverseas: e.target.checked })}
                    />
                    <label className="form-check-label text-white" htmlFor="isOverseasCheck">
                      Overseas Player ✈️
                    </label>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Role</label>
                  <select
                    className="form-select form-select-dark"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="BATTER">Batter</option>
                    <option value="BOWLER">Bowler</option>
                    <option value="ALL_ROUNDER">All-Rounder</option>
                    <option value="WICKET_KEEPER">Wicket-Keeper</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Category</label>
                  <select
                    className="form-select form-select-dark"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="MARQUEE">Marquee Set</option>
                    <option value="CAPPED">Capped</option>
                    <option value="UNCAPPED">Uncapped</option>
                    <option value="EMERGING">Emerging</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Base Price (in INR)</label>
                  <select
                    className="form-select form-select-dark"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  >
                    <option value={2000000}>₹20 Lakhs</option>
                    <option value={3000000}>₹30 Lakhs</option>
                    <option value={5000000}>₹50 Lakhs</option>
                    <option value={7500000}>₹75 Lakhs</option>
                    <option value={10000000}>₹1.00 Crore</option>
                    <option value={15000000}>₹1.50 Crore</option>
                    <option value={20000000}>₹2.00 Crores</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Status</label>
                  <select
                    className="form-select form-select-dark"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_AUCTION">In Auction</option>
                    <option value="SOLD">Sold</option>
                    <option value="UNSOLD">Unsold</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Image URL</label>
                <input
                  type="url"
                  className="form-control form-control-dark"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-premium-glass"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-premium-accent">
                  {editingPlayer ? 'Save Changes' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayerManager;
