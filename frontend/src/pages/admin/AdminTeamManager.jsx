import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/teamService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { formatPurse } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import TeamLogo from '../../components/common/TeamLogo';

const AdminTeamManager = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    logo: '🏏',
    initialPurse: 1200000000,
    remainingPurse: 1200000000,
    maxSquadSize: 25,
    maxOverseas: 8,
    primaryColor: '#00f0ff',
    secondaryColor: '#0a1324'
  });

  const loadTeams = async () => {
    try {
      const res = await teamService.getTeams();
      if (res) setTeams(res);
    } catch (err) {
      console.error('Failed to load teams:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleOpenAdd = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      shortName: '',
      logo: '🏏',
      initialPurse: 1200000000,
      remainingPurse: 1200000000,
      maxSquadSize: 25,
      maxOverseas: 8,
      primaryColor: '#00f0ff',
      secondaryColor: '#0a1324'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      shortName: team.shortName,
      logo: team.logo || '🏏',
      initialPurse: team.initialPurse,
      remainingPurse: team.remainingPurse,
      maxSquadSize: team.maxSquadSize || 25,
      maxOverseas: team.maxOverseas || 8,
      primaryColor: team.primaryColor || '#00f0ff',
      secondaryColor: team.secondaryColor || '#0a1324'
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await teamService.deleteTeam(id);
      addToast(`Deleted ${name}`, 'success');
      loadTeams();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamService.updateTeam(editingTeam._id, formData);
        addToast(`Updated ${formData.name}`, 'success');
      } else {
        await teamService.createTeam(formData);
        addToast(`Created franchise ${formData.name}`, 'success');
      }
      setShowModal(false);
      loadTeams();
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
                  FRANCHISE DIRECTORY
                </span>
                <h2 className="text-white font-display fw-bold mb-0">MANAGE FRANCHISES</h2>
              </div>

              <button onClick={handleOpenAdd} className="btn btn-premium-accent">
                <i className="bi bi-plus-circle me-1"></i> Add New Franchise
              </button>
            </div>

            {/* Teams Grid */}
            <div className="glass-card p-4">
              <div className="table-responsive">
                <table className="table table-dark-custom">
                  <thead>
                    <tr>
                      <th>Franchise</th>
                      <th>Owner</th>
                      <th>Remaining Purse</th>
                      <th>Squad</th>
                      <th>Colors</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t) => (
                      <tr key={t._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <TeamLogo team={t} size={30} />
                            <div>
                              <div className="text-white fw-bold">{t.name}</div>
                              <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>{t.shortName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-white-50">{t.owner?.name || 'Unassigned'}</td>
                        <td className="text-success font-display fw-bold fs-5">
                          {formatPurse(t.remainingPurse)}
                        </td>
                        <td className="text-white">
                          {t.squadCount || 0} / {t.maxSquadSize || 25}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: t.primaryColor || '#00f0ff',
                                display: 'inline-block'
                              }}
                            ></span>
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: t.secondaryColor || '#0a1324',
                                display: 'inline-block'
                              }}
                            ></span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="btn btn-sm btn-premium-glass py-1 px-2"
                              title="Edit Team"
                            >
                              <i className="bi bi-pencil-square text-info"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(t._id, t.name)}
                              className="btn btn-sm btn-premium-glass py-1 px-2 text-danger"
                              title="Delete Team"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Modal */}
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
            style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
              <h4 className="text-white font-display fw-bold mb-0">
                {editingTeam ? 'EDIT FRANCHISE' : 'NEW FRANCHISE'}
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
                <div className="col-md-8">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Franchise Name</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-dark"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Short Code (4 max)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    className="form-control form-control-dark uppercase"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Initial Purse (INR)</label>
                  <input
                    type="number"
                    required
                    className="form-control form-control-dark"
                    value={formData.initialPurse}
                    onChange={(e) => setFormData({ ...formData, initialPurse: Number(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Logo Emoji / Icon</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Max Squad Size</label>
                  <input
                    type="number"
                    className="form-control form-control-dark"
                    value={formData.maxSquadSize}
                    onChange={(e) => setFormData({ ...formData, maxSquadSize: Number(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Max Overseas</label>
                  <input
                    type="number"
                    className="form-control form-control-dark"
                    value={formData.maxOverseas}
                    onChange={(e) => setFormData({ ...formData, maxOverseas: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Primary Theme Color</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="color"
                      className="form-control form-control-color bg-transparent border-0"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>Secondary Color</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="color"
                      className="form-control form-control-color bg-transparent border-0"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
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
                  {editingTeam ? 'Save Franchise' : 'Create Franchise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamManager;
