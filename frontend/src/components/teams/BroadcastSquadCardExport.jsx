import React, { useRef, useState, useEffect } from 'react';
import { formatPurse } from '../../utils/formatters';

const BroadcastSquadCardExport = ({ team, onClose }) => {
  const canvasRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const squad = team?.players || [];
  const totalSpent = (team?.initialPurse || 1200000000) - (team?.remainingPurse || 0);

  // Render HD 1200x675 Broadcast Card onto HTML5 Canvas
  const drawBroadcastCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#060d1d');
    bgGradient.addColorStop(0.5, '#0b162c');
    bgGradient.addColorStop(1, '#050a14');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Accent team color sweep
    const accentGrad = ctx.createRadialGradient(200, 200, 50, 200, 200, 600);
    accentGrad.addColorStop(0, `${team.primaryColor || '#00f0ff'}40`);
    accentGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Broadcast Border
    ctx.strokeStyle = team.primaryColor || '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Corner Accents
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(20, 20, 40, 6);
    ctx.fillRect(20, 20, 6, 40);
    ctx.fillRect(width - 60, 20, 40, 6);
    ctx.fillRect(width - 26, 20, 6, 40);

    // Top Header Banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(30, 30, width - 60, 110);

    // Logo & Team Title
    ctx.font = 'bold 44px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${team.name.toUpperCase()} [${team.shortName || 'IPL'}]`, 60, 95);

    ctx.font = '600 16px "Inter", sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('OFFICIAL IPL AUCTION SQUAD & FINANCIAL RECAP', 60, 125);

    // Right Header Metrics (Purse Spent & Remaining)
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('TOTAL SPENT', width - 360, 75);
    ctx.fillText('REMAINING PURSE', width - 180, 75);

    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(formatPurse(totalSpent), width - 360, 110);

    ctx.fillStyle = '#00e676';
    ctx.fillText(formatPurse(team.remainingPurse), width - 180, 110);

    // Left Column: Squad Stats & Top Buys Spotlight (x: 50 to 420)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.roundRect(50, 165, 380, 460, 16);
    ctx.fill();

    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('MARQUEE SIGNINGS SPOTLIGHT', 75, 205);

    // Sort squad by highest buy price
    const topBuys = [...squad].sort((a, b) => b.buyPrice - a.buyPrice).slice(0, 4);
    let topY = 245;
    topBuys.forEach((item, idx) => {
      const p = item.player;
      if (!p) return;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.roundRect(75, topY - 24, 330, 52, 10);
      ctx.fill();

      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${idx + 1}. ${p.name} ${p.isOverseas ? '✈️' : ''}`, 90, topY + 8);

      ctx.font = '600 16px "Outfit", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(formatPurse(item.buyPrice), 300, topY + 8);

      topY += 62;
    });

    // Squad Count Pill
    ctx.font = '600 16px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Squad Size: ${squad.length} / ${team.maxSquadSize || 25}`, 75, 520);
    ctx.fillText(`Overseas Players: ${squad.filter((s) => s.player?.isOverseas).length} / ${team.maxOverseas || 8} ✈️`, 75, 550);
    ctx.fillText(`RTM Cards Left: ${team.rtmCards ?? 2}`, 75, 580);

    // Right Column: Complete Squad Roster Grid (x: 455 to 1150)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.roundRect(455, 165, 695, 460, 16);
    ctx.fill();

    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('COMPLETE SQUAD ROSTER', 485, 205);

    // Display squad players in 3 columns
    let rosterX = 485;
    let rosterY = 245;
    squad.forEach((item, index) => {
      const p = item.player;
      if (!p) return;

      ctx.font = '500 14px "Inter", sans-serif';
      ctx.fillStyle = '#e0e0e0';
      const displayName = p.name.length > 15 ? p.name.slice(0, 14) + '..' : p.name;
      ctx.fillText(`• ${displayName}`, rosterX, rosterY);

      ctx.font = '600 13px "Outfit", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(formatPurse(item.buyPrice), rosterX + 135, rosterY);

      rosterY += 28;
      if (rosterY > 580) {
        rosterY = 245;
        rosterX += 225;
      }
    });

    if (squad.length === 0) {
      ctx.font = '16px "Inter", sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText('No players acquired yet in this auction.', 485, 260);
    }

    // Bottom Watermark
    ctx.font = '600 12px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('AUCTIONX • PREMIER REAL-TIME CRICKET AUCTION PLATFORM', width - 420, height - 35);
  };

  useEffect(() => {
    drawBroadcastCard();
  }, [team]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGenerating(true);
    const link = document.createElement('a');
    link.download = `${team.shortName.toLowerCase()}-ipl-auction-squad-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setGenerating(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 9995,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div
        className="glass-card p-4 text-center d-flex flex-column align-items-center"
        style={{
          maxWidth: '920px',
          width: '100%',
          borderRadius: '24px',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}
      >
        {/* Header */}
        <div className="w-100 d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.4rem' }}>📺</span>
            <h5 className="text-white font-display fw-bold mb-0">BROADCAST SQUAD CARD GRAPHIC</h5>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-outline-secondary rounded-circle"
              style={{ width: '32px', height: '32px', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Canvas Preview */}
        <div className="w-100 overflow-hidden rounded-3 mb-3 border border-secondary border-opacity-50">
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '480px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* Download Action Bar */}
        <div className="d-flex gap-3 justify-content-center w-100">
          <button
            type="button"
            onClick={handleDownload}
            disabled={generating}
            className="btn btn-premium-accent py-2 px-4 fw-bold font-display"
            style={{ borderRadius: '12px' }}
          >
            📥 Download High-Res Graphic (PNG)
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-premium-glass py-2 px-4"
              style={{ borderRadius: '12px' }}
            >
              Close Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastSquadCardExport;
