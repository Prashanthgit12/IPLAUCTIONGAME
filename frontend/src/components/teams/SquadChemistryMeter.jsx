import React from 'react';

export const calculateSquadChemistry = (players = []) => {
  const squad = players.map((p) => p.player || p);

  const batters = squad.filter((p) => p.role === 'BATTER');
  const bowlers = squad.filter((p) => p.role === 'BOWLER');
  const allRounders = squad.filter((p) => p.role === 'ALL_ROUNDER');
  const wicketKeepers = squad.filter((p) => p.role === 'WICKET_KEEPER');
  const overseas = squad.filter((p) => p.isOverseas);
  const capped = squad.filter((p) => p.isCapped !== false);

  // 1. Batting Power Rating (0 - 100)
  let battingScore = 20;
  battingScore += Math.min(35, (batters.length + wicketKeepers.length) * 7);
  battingScore += Math.min(25, allRounders.length * 6);
  const avgSR = squad.length
    ? squad.reduce((sum, p) => sum + (p.stats?.strikeRate || 120), 0) / squad.length
    : 120;
  if (avgSR >= 135) battingScore += 20;
  else if (avgSR >= 125) battingScore += 12;
  else battingScore += 5;
  battingScore = Math.min(99, Math.round(battingScore));

  // 2. Bowling Depth Rating (0 - 100)
  let bowlingScore = 20;
  bowlingScore += Math.min(40, bowlers.length * 8);
  bowlingScore += Math.min(25, allRounders.length * 6);
  const pacers = squad.filter((p) => p.bowlingType === 'PACE' || p.bowlingType === 'FAST');
  const spinners = squad.filter((p) => p.bowlingType === 'SPIN');
  if (pacers.length >= 3 && spinners.length >= 2) bowlingScore += 15;
  else if (pacers.length >= 2 || spinners.length >= 1) bowlingScore += 8;
  bowlingScore = Math.min(99, Math.round(bowlingScore));

  // 3. All-Rounder Balance (0 - 100)
  let allRounderScore = Math.min(98, 25 + allRounders.length * 18);

  // 4. Overall Squad Chemistry Composite (0 - 100)
  const overallChemistry = Math.round(
    battingScore * 0.38 + bowlingScore * 0.38 + allRounderScore * 0.24
  );

  // Tactical Advice Insights
  const insights = [];
  if (wicketKeepers.length === 0) {
    insights.push({ text: 'No Wicketkeeper yet — Must acquire 1+ specialist keeper', type: 'danger' });
  } else {
    insights.push({ text: `${wicketKeepers.length} Specialist Wicketkeeper(s) secured`, type: 'success' });
  }

  if (squad.length < 18) {
    insights.push({ text: `Needs ${18 - squad.length} more players to meet IPL 18-man squad rule`, type: 'warning' });
  } else {
    insights.push({ text: `IPL Squad quota met (${squad.length}/25 slots)`, type: 'success' });
  }

  if (overseas.length === 8) {
    insights.push({ text: 'Overseas limit reached (8/8 slots full)', type: 'info' });
  } else {
    insights.push({ text: `${8 - overseas.length} overseas slot(s) remaining`, type: 'secondary' });
  }

  if (pacers.length >= 3 && spinners.length >= 2) {
    insights.push({ text: 'Balanced dual-threat bowling attack (Pace + Spin)', type: 'success' });
  }

  return {
    battingScore,
    bowlingScore,
    allRounderScore,
    overallChemistry,
    battersCount: batters.length,
    bowlersCount: bowlers.length,
    allRoundersCount: allRounders.length,
    wicketKeepersCount: wicketKeepers.length,
    overseasCount: overseas.length,
    cappedCount: capped.length,
    insights
  };
};

const SquadChemistryMeter = ({ squad = [], teamName = 'Franchise' }) => {
  const analysis = calculateSquadChemistry(squad);

  const getMeterColor = (val) => {
    if (val >= 85) return '#00f0ff';
    if (val >= 70) return '#ffd700';
    if (val >= 50) return '#00e676';
    return '#ff5252';
  };

  return (
    <div
      className="glass-card p-4 h-100"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px'
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">⚡</span>
          <div>
            <h5 className="text-white font-display fw-bold mb-0">SQUAD CHEMISTRY & POWER</h5>
            <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
              Real-time franchise balance algorithm
            </div>
          </div>
        </div>

        {/* Overall Badge */}
        <div className="text-end">
          <div
            className="font-display fw-bold fs-3"
            style={{ color: getMeterColor(analysis.overallChemistry), lineHeight: 1 }}
          >
            {analysis.overallChemistry}
            <span style={{ fontSize: '0.85rem', color: '#999' }}>/100</span>
          </div>
          <span className="badge bg-dark border border-secondary" style={{ fontSize: '0.68rem' }}>
            {analysis.overallChemistry >= 85
              ? 'TITAN CONTENDER'
              : analysis.overallChemistry >= 70
              ? 'BALANCED'
              : 'BUILDING SQUAD'}
          </span>
        </div>
      </div>

      {/* Power Bars */}
      <div className="d-flex flex-column gap-3 my-3">
        {/* Batting Power */}
        <div>
          <div className="d-flex justify-content-between text-white small mb-1">
            <span className="text-secondary">
              🏏 Batting Firepower ({analysis.battersCount} Batters + {analysis.wicketKeepersCount} Keepers)
            </span>
            <strong style={{ color: getMeterColor(analysis.battingScore) }}>{analysis.battingScore}%</strong>
          </div>
          <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="progress-bar"
              style={{
                width: `${analysis.battingScore}%`,
                background: 'linear-gradient(90deg, #ff9100 0%, #ffd700 100%)',
                borderRadius: '4px'
              }}
            ></div>
          </div>
        </div>

        {/* Bowling Depth */}
        <div>
          <div className="d-flex justify-content-between text-white small mb-1">
            <span className="text-secondary">
              🎯 Bowling Depth ({analysis.bowlersCount} Specialist Bowlers)
            </span>
            <strong style={{ color: getMeterColor(analysis.bowlingScore) }}>{analysis.bowlingScore}%</strong>
          </div>
          <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="progress-bar"
              style={{
                width: `${analysis.bowlingScore}%`,
                background: 'linear-gradient(90deg, #00f0ff 0%, #0072ff 100%)',
                borderRadius: '4px'
              }}
            ></div>
          </div>
        </div>

        {/* All-Rounder Versatility */}
        <div>
          <div className="d-flex justify-content-between text-white small mb-1">
            <span className="text-secondary">
              ⚡ All-Rounder Versatility ({analysis.allRoundersCount} All-Rounders)
            </span>
            <strong style={{ color: getMeterColor(analysis.allRounderScore) }}>{analysis.allRounderScore}%</strong>
          </div>
          <div className="progress" style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="progress-bar"
              style={{
                width: `${analysis.allRounderScore}%`,
                background: 'linear-gradient(90deg, #00e676 0%, #00b0ff 100%)',
                borderRadius: '4px'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tactical Insights */}
      <div className="pt-2 border-top border-secondary border-opacity-25 mt-3">
        <span className="text-secondary" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tactical Squad Feedback
        </span>
        <div className="d-flex flex-wrap gap-1.5 mt-1.5">
          {analysis.insights.map((item, idx) => (
            <span
              key={idx}
              className={`badge bg-${item.type} bg-opacity-20 text-${item.type} border border-${item.type} border-opacity-50`}
              style={{ fontSize: '0.73rem', padding: '4px 8px' }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SquadChemistryMeter;
