import React, { useState } from 'react';

const marqueePlayers = [
  {
    name: 'VIRAT KOHLI',
    role: 'BATSMAN',
    team: 'RCB',
    tag: 'POWER OPENER',
    image: '/players/virat-kohli.jpg',
    accentColor: '#d71920',
    stats: '8,004 Runs • 131.9 SR'
  },
  {
    name: 'ROHIT SHARMA',
    role: 'BATSMAN',
    team: 'MI',
    tag: 'HITMAN',
    image: '/players/rohit-sharma.jpg',
    accentColor: '#004ba0',
    stats: '6,628 Runs • 5x Champion'
  },
  {
    name: 'MS DHONI',
    role: 'WICKET-KEEPER',
    team: 'CSK',
    tag: 'THALA • LEGEND',
    image: '/players/ms-dhoni.jpg',
    accentColor: '#fdb913',
    stats: '5x Champion • Legendary Finisher'
  },
  {
    name: 'JASPRIT BUMRAH',
    role: 'BOWLER',
    team: 'MI',
    tag: 'DEATH MASTER',
    image: '/players/jasprit-bumrah.jpg',
    accentColor: '#004ba0',
    stats: '165 Wickets • 7.30 Econ'
  },
  {
    name: 'SHUBMAN GILL',
    role: 'BATSMAN',
    team: 'GT',
    tag: 'CAPTAIN ACE',
    image: '/players/shubman-gill.jpg',
    accentColor: '#1b2133',
    stats: '890 Season High • 3,216 Runs'
  },
  {
    name: 'SURYAKUMAR YADAV',
    role: 'BATSMAN',
    team: 'MI',
    tag: 'MR. 360',
    image: '/players/suryakumar-yadav.jpg',
    accentColor: '#004ba0',
    stats: 'T20 #1 Master • 175+ SR'
  },
  {
    name: 'RISHABH PANT',
    role: 'WICKET-KEEPER',
    team: 'LSG',
    tag: 'DYNAMO',
    image: '/players/rishabh-pant.jpg',
    accentColor: '#38bdf8',
    stats: 'Dynamic Captain • 3,284 Runs'
  },
  {
    name: 'TRAVIS HEAD',
    role: 'BATSMAN',
    team: 'SRH',
    tag: 'BLITZKRIEG',
    image: '/players/travis-head.jpg',
    accentColor: '#f26522',
    stats: 'Powerplay Destructor • 191.5 SR'
  },
  {
    name: 'SUNIL NARINE',
    role: 'ALL-ROUNDER',
    team: 'KKR',
    tag: 'MVP LEGEND',
    image: '/players/sunil-narine.jpg',
    accentColor: '#3a225d',
    stats: '180 Wickets • 1,500+ Runs'
  },
  {
    name: 'RASHID KHAN',
    role: 'BOWLER',
    team: 'GT',
    tag: 'SPIN WIZARD',
    image: '/players/rashid-khan.jpg',
    accentColor: '#1b2133',
    stats: '149 Wickets • 6.82 Econ'
  }
];

const MarqueeCardStack = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % marqueePlayers.length);
      setAnimating(false);
    }, 280);
  };

  const getCard = (offset) => {
    const idx = (currentIndex + offset) % marqueePlayers.length;
    return marqueePlayers[idx];
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100">
      {/* 3D Stack Container */}
      <div
        onClick={handleNext}
        style={{
          position: 'relative',
          width: '320px',
          height: '460px',
          cursor: 'pointer',
          userSelect: 'none',
          perspective: '1000px'
        }}
        title="Tap or drag to cycle cards"
      >
        {/* Render 3 cards deep */}
        {[2, 1, 0].map((depth) => {
          const card = getCard(depth);
          const isTop = depth === 0;

          // Compute 3D offset and rotation
          const translateX = depth * 14;
          const translateY = depth * -6;
          const rotateZ = depth * 3.5;
          const scale = 1 - depth * 0.05;
          const opacity = depth === 0 ? 1 : depth === 1 ? 0.8 : 0.55;

          return (
            <div
              key={`${card.name}-${depth}`}
              className="marquee-stack-card"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                background: 'linear-gradient(165deg, #151922 0%, #0d1017 60%, #080a0e 100%)',
                border: isTop
                  ? '1px solid rgba(255, 255, 255, 0.16)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: isTop
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 240, 255, 0.08)'
                  : '0 15px 30px -10px rgba(0, 0, 0, 0.5)',
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotateZ}deg) scale(${scale})`,
                transformOrigin: 'bottom right',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 10 - depth,
                opacity,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px'
              }}
            >
              {/* Subtle background glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: card.accentColor,
                  filter: 'blur(70px)',
                  opacity: 0.25,
                  pointerEvents: 'none'
                }}
              />

              {/* Card Header */}
              <div className="d-flex align-items-center justify-content-between position-relative" style={{ zIndex: 2 }}>
                <span
                  style={{
                    background: '#fdb913',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    letterSpacing: '0.05em',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  {card.tag}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'rgba(255, 255, 255, 0.45)',
                    letterSpacing: '0.05em'
                  }}
                >
                  IPL 2026
                </span>
              </div>

              {/* Player Image */}
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  left: '0',
                  right: '0',
                  bottom: '85px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  zIndex: 1
                }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center top',
                    transform: isTop ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.4s ease'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500';
                  }}
                />
                {/* Bottom gradient fade so text is crisp */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '110px',
                    background: 'linear-gradient(to top, #0d1017 15%, transparent 100%)'
                  }}
                />
              </div>

              {/* Card Footer */}
              <div className="position-relative" style={{ zIndex: 2, marginTop: 'auto' }}>
                <h3
                  className="font-display fw-bold mb-1 text-white"
                  style={{
                    fontSize: '1.75rem',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.05',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                  }}
                >
                  {card.name}
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: 'rgba(255, 255, 255, 0.65)',
                      letterSpacing: '0.08em'
                    }}
                  >
                    {card.role} • <span style={{ color: '#00f0ff' }}>{card.team}</span>
                  </span>
                  <span className="badge bg-dark bg-opacity-75 text-warning border border-secondary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                    {card.stats}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Dots & Counter */}
      <div className="d-flex align-items-center justify-content-between w-100 mt-3 px-2" style={{ maxWidth: '320px' }}>
        <span className="badge bg-dark bg-opacity-75 border border-secondary border-opacity-50 text-warning font-display" style={{ fontSize: '0.72rem' }}>
          {currentIndex + 1} / {marqueePlayers.length}
        </span>
        <div className="d-flex align-items-center gap-1">
          {marqueePlayers.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === currentIndex ? '16px' : '5px',
                height: '5px',
                borderRadius: '3px',
                background: i === currentIndex ? '#fdb913' : 'rgba(255, 255, 255, 0.25)',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
            />
          ))}
        </div>
      </div>

      {/* Helper Caption */}
      <p
        className="text-secondary text-center mt-2 mb-0 fw-semibold"
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.06em',
          maxWidth: '320px',
          lineHeight: '1.4'
        }}
      >
        <i className="bi bi-hand-index-thumb me-1 text-warning"></i>
        TAP THE STACK TO CYCLE MARQUEE PLAYERS (10 SUPERSTARS)
      </p>
    </div>
  );
};

export default MarqueeCardStack;
