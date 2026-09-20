import React, { useState } from 'react';
import { playerService } from '../../services/playerService';
import { useToast } from '../../context/ToastContext';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=700&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=700&auto=format&fit=crop&q=80'
];

const CustomPlayerModal = ({ onClose, onPlayerCreated }) => {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    isOverseas: false,
    role: 'ALL_ROUNDER',
    category: 'CAPPED',
    isCapped: true,
    auctionSet: 'AL1',
    bowlingType: 'PACE',
    battingPosition: 'MIDDLE_ORDER',
    age: 24,
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium-fast',
    basePrice: 20000000, // 2 Cr
    image: AVATAR_PRESETS[0],
    matches: 25,
    runs: 650,
    highestScore: '78*',
    wickets: 18,
    bestBowling: '3/22',
    strikeRate: 142.5,
    economy: 8.2
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please provide player name', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        country: formData.country,
        isOverseas: formData.isOverseas,
        role: formData.role,
        category: formData.category,
        isCapped: formData.category !== 'UNCAPPED',
        auctionSet: formData.auctionSet,
        bowlingType: formData.bowlingType,
        battingPosition: formData.battingPosition,
        age: Number(formData.age),
        battingStyle: formData.battingStyle,
        bowlingStyle: formData.bowlingStyle,
        basePrice: Number(formData.basePrice),
        image: formData.image,
        stats: {
          matches: Number(formData.matches),
          runs: Number(formData.runs),
          highestScore: formData.highestScore,
          wickets: Number(formData.wickets),
          bestBowling: formData.bestBowling,
          strikeRate: Number(formData.strikeRate),
          economy: Number(formData.economy)
        }
      };

      await playerService.createPlayer(payload);
      addToast(`Cricketer ${formData.name} added to the official auction register!`, 'success');
      if (onPlayerCreated) onPlayerCreated();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create player', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content glass-card border border-secondary border-opacity-25" style={{ background: '#0c142b' }}>
          {/* Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 py-3">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.4rem' }}>🌟</span>
              <div>
                <h5 className="modal-title text-white font-display fw-bold mb-0">CUSTOM PLAYER CREATOR</h5>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Register Custom Cricketers to Bid on in Live Auction
                </span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Form Body */}
          <div className="modal-body p-3 p-md-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">CRICKETER FULL NAME</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-dark"
                    placeholder="e.g. Aryan Malhotra"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Country */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">COUNTRY</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control form-control-dark"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Role */}
                <div className="col-md-4 col-6">
                  <label className="form-label text-secondary small fw-bold">PRIMARY ROLE</label>
                  <select name="role" className="form-select form-select-dark" value={formData.role} onChange={handleChange}>
                    <option value="BATTER">🏏 Batter</option>
                    <option value="BOWLER">⚡ Bowler</option>
                    <option value="ALL_ROUNDER">👑 All-Rounder</option>
                    <option value="WICKET_KEEPER">🧤 Wicket-Keeper</option>
                  </select>
                </div>

                {/* Category (Capped vs Uncapped) */}
                <div className="col-md-4 col-6">
                  <label className="form-label text-secondary small fw-bold">STATUS CATEGORY</label>
                  <select name="category" className="form-select form-select-dark" value={formData.category} onChange={handleChange}>
                    <option value="CAPPED">Capped International</option>
                    <option value="UNCAPPED">Uncapped Domestic Talent</option>
                    <option value="MARQUEE">Marquee Elite</option>
                  </select>
                </div>

                {/* Base Price */}
                <div className="col-md-4 col-12">
                  <label className="form-label text-secondary small fw-bold">BASE PRICE</label>
                  <select name="basePrice" className="form-select form-select-dark" value={formData.basePrice} onChange={handleChange}>
                    <option value={2000000}>₹20 Lakhs (Uncapped standard)</option>
                    <option value={4000000}>₹40 Lakhs</option>
                    <option value={5000000}>₹50 Lakhs</option>
                    <option value={10000000}>₹1.00 Crore</option>
                    <option value={15000000}>₹1.50 Crore</option>
                    <option value={20000000}>₹2.00 Crore (Marquee)</option>
                  </select>
                </div>

                {/* Batting & Bowling Styles */}
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">BATTING STYLE</label>
                  <input
                    type="text"
                    name="battingStyle"
                    className="form-control form-control-dark"
                    value={formData.battingStyle}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">BOWLING STYLE</label>
                  <input
                    type="text"
                    name="bowlingStyle"
                    className="form-control form-control-dark"
                    value={formData.bowlingStyle}
                    onChange={handleChange}
                  />
                </div>

                {/* Preset Avatars */}
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold mb-1">PLAYER PORTRAIT AVATAR</label>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Avatar"
                        onClick={() => setFormData(prev => ({ ...prev, image: url }))}
                        style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: formData.image === url ? '3px solid #00f0ff' : '2px solid transparent'
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="url"
                    name="image"
                    className="form-control form-control-dark"
                    placeholder="Or paste custom image URL..."
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>

                {/* Stats Row */}
                <div className="col-12 mt-2">
                  <span className="text-info font-display fw-bold small">CAREER T20 STATISTICS</span>
                </div>
                <div className="col-3">
                  <label className="form-label text-secondary small">Matches</label>
                  <input type="number" name="matches" className="form-control form-control-dark form-control-sm" value={formData.matches} onChange={handleChange} />
                </div>
                <div className="col-3">
                  <label className="form-label text-secondary small">Runs</label>
                  <input type="number" name="runs" className="form-control form-control-dark form-control-sm" value={formData.runs} onChange={handleChange} />
                </div>
                <div className="col-3">
                  <label className="form-label text-secondary small">Wickets</label>
                  <input type="number" name="wickets" className="form-control form-control-dark form-control-sm" value={formData.wickets} onChange={handleChange} />
                </div>
                <div className="col-3">
                  <label className="form-label text-secondary small">Strike Rate</label>
                  <input type="number" step="0.1" name="strikeRate" className="form-control form-control-dark form-control-sm" value={formData.strikeRate} onChange={handleChange} />
                </div>

                {/* Submit Buttons */}
                <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary text-white px-3" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold font-display" disabled={submitting}>
                    {submitting ? 'Registering...' : 'REGISTER CRICKETER'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPlayerModal;
