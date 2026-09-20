import React from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Aditya Sharma',
    role: 'Mumbai Indians Owner',
    tag: 'MI War Room Host',
    team: 'MI',
    teamColor: '#004ba0',
    avatarBg: 'linear-gradient(135deg, #004ba0 0%, #00f0ff 100%)',
    rating: 5,
    headline: 'Felt exactly like draft night on Star Sports!',
    quote:
      'The private room multiplayer is unreal. 10 of us ran a mock auction with ₹120 Cr purses. When Bumrah came up with the heartbeat countdown racing, it was pure adrenaline!'
  },
  {
    id: 2,
    name: 'Karan Verma',
    role: 'Chennai Super Kings Owner',
    tag: 'Tactical XI Champion',
    team: 'CSK',
    teamColor: '#fdb913',
    avatarBg: 'linear-gradient(135deg, #fdb913 0%, #ff8c00 100%)',
    rating: 5,
    headline: 'Squad Chemistry meter is a total game changer',
    quote:
      'In other games you just stack big names without thinking. Here, if you fail to balance pace with spin or forget a keeper, your score drops. That tactical realism is top tier.'
  },
  {
    id: 3,
    name: 'Rohit Rajan',
    role: 'Tournament Room Host',
    tag: 'Room #8841 Host',
    team: 'KKR',
    teamColor: '#3a225d',
    avatarBg: 'linear-gradient(135deg, #3a225d 0%, #d4af37 100%)',
    rating: 5,
    headline: 'Mid-tournament Trade Desk was seamless',
    quote:
      'We negotiated a swap trading Shubman Gill plus ₹5 Cr cash right inside the Trade Desk modal without stopping the room. Everything synced automatically in real time.'
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'Cricket Analyst & Spectator',
    tag: 'Verified League Viewer',
    team: 'RCB',
    teamColor: '#d71920',
    avatarBg: 'linear-gradient(135deg, #d71920 0%, #000000 100%)',
    rating: 5,
    headline: 'Soundboard & Squad Certificate blew us away',
    quote:
      'The air horns on ₹10 Cr bids and crowd cheers on hammer strikes gave literal goosebumps. Exporting the 1200x675 HD Squad Certificate to WhatsApp made our night.'
  },
  {
    id: 5,
    name: 'Vikramaditya Rao',
    role: 'Sunrisers Hyderabad Owner',
    tag: 'SRH Strategist',
    team: 'SRH',
    teamColor: '#f26522',
    avatarBg: 'linear-gradient(135deg, #f26522 0%, #ffab00 100%)',
    rating: 5,
    headline: 'Wishlist Target Board saved our entire auction',
    quote:
      'Pre-shortlisting Travis Head and Klaasen with budget caps kept us disciplined. When Head entered the block, the golden alert banner popped up instantly. We won him at ₹14.5 Cr!'
  },
  {
    id: 6,
    name: 'Harshvardhan Singh',
    role: 'Rajasthan Royals Owner',
    tag: 'Royals Draft Master',
    team: 'RR',
    teamColor: '#ea1a85',
    avatarBg: 'linear-gradient(135deg, #ea1a85 0%, #254aa5 100%)',
    rating: 5,
    headline: 'Clean ₹120 Cr start is so refreshing',
    quote:
      'No pre-spent dummy purse, no fake bot retainers. Starting with an empty squad and 100% full ₹120 Cr budget made this feel like a true IPL mega auction from scratch.'
  },
  {
    id: 7,
    name: 'Nikhil Aggarwal',
    role: 'Delhi Capitals Owner',
    tag: 'Room League Champion',
    team: 'DC',
    teamColor: '#004c97',
    avatarBg: 'linear-gradient(135deg, #004c97 0%, #d71920 100%)',
    rating: 5,
    headline: 'Socket bidding speed is lightning fast with 0 lag',
    quote:
      'Anti-sniping extensions and instant live bid updates worked flawlessly even when 8 of us were hammering the bid button simultaneously. Super responsive on mobile too.'
  },
  {
    id: 8,
    name: 'Pranav Trivedi',
    role: 'Gujarat Titans Owner',
    tag: 'Titans Draft Lead',
    team: 'GT',
    teamColor: '#1b2133',
    avatarBg: 'linear-gradient(135deg, #1b2133 0%, #00f0ff 100%)',
    rating: 5,
    headline: 'RTM Card mechanics worked like real BCCI rules',
    quote:
      'When Rashid Khan was about to go to another franchise, the RTM match prompt popped up on my screen and I matched the winning bid to retain him. Absolutely electrifying!'
  },
  {
    id: 9,
    name: 'Devendra Mishra',
    role: 'Lucknow Super Giants Owner',
    tag: 'LSG Brigade Host',
    team: 'LSG',
    teamColor: '#38bdf8',
    avatarBg: 'linear-gradient(135deg, #38bdf8 0%, #ff5252 100%)',
    rating: 5,
    headline: 'Real-time Leaderboard & MVP Honours are top class',
    quote:
      'The Golden Gavel and Steal of the Auction awards updated live after every sale. Our group spent hours analyzing who played the smartest money game.'
  },
  {
    id: 10,
    name: 'Gurpreet Singh',
    role: 'Punjab Kings Owner',
    tag: 'Mullanpur Kings Host',
    team: 'PBKS',
    teamColor: '#dd1f2d',
    avatarBg: 'linear-gradient(135deg, #dd1f2d 0%, #ffd700 100%)',
    rating: 5,
    headline: 'Best cricket simulator created for friends',
    quote:
      'We run weekend leagues every Sunday. The user interface looks like a million-dollar broadcast app. Super clean, modern dark aesthetic and zero bugs.'
  }
];

const TestimonialCard = ({ item }) => (
  <div
    className="glass-card p-4 d-flex flex-column justify-content-between position-relative overflow-hidden testimonial-marquee-card"
    style={{
      width: '350px',
      minWidth: '350px',
      height: '235px',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      margin: '0 12px',
      flexShrink: 0,
      transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
    }}
  >
    {/* Team Accent Top Line */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: item.teamColor
      }}
    />

    {/* Header: Stars & Tag */}
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex text-warning gap-1" style={{ fontSize: '0.8rem' }}>
          {[...Array(item.rating)].map((_, i) => (
            <i key={i} className="bi bi-star-fill"></i>
          ))}
        </div>
        <span
          className="badge font-display fw-bold"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: item.teamColor === '#1b2133' ? '#00f0ff' : item.teamColor,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.68rem',
            padding: '3px 8px'
          }}
        >
          {item.tag}
        </span>
      </div>

      <h6 className="text-white font-display fw-bold mb-1.5 text-truncate" style={{ fontSize: '0.96rem' }}>
        "{item.headline}"
      </h6>
      <p
        className="text-secondary mb-0"
        style={{
          fontSize: '0.84rem',
          lineHeight: '1.45',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {item.quote}
      </p>
    </div>

    {/* Author Info */}
    <div className="d-flex align-items-center justify-content-between pt-2.5 border-top border-secondary border-opacity-25 mt-auto">
      <div className="d-flex align-items-center gap-2.5">
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: item.avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            flexShrink: 0
          }}
        >
          {item.name.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <div className="text-white fw-bold d-flex align-items-center gap-1 text-truncate" style={{ fontSize: '0.86rem' }}>
            <span>{item.name}</span>
            <i className="bi bi-patch-check-fill text-info" style={{ fontSize: '0.78rem' }} title="Verified Manager"></i>
          </div>
          <span className="text-secondary d-block text-truncate" style={{ fontSize: '0.72rem' }}>
            {item.role}
          </span>
        </div>
      </div>

      <span className="badge bg-secondary bg-opacity-50 text-white-50 font-display" style={{ fontSize: '0.65rem' }}>
        {item.team}
      </span>
    </div>
  </div>
);

const TestimonialMarquee = () => {
  return (
    <section className="py-5 position-relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.012)' }}>
      {/* Inline Keyframes for smooth infinite marquee */}
      <style>{`
        @keyframes marqueeScrollSingle {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track-single {
          display: flex;
          width: max-content;
          animation: marqueeScrollSingle 42s linear infinite;
        }
        .marquee-container:hover .marquee-track-single {
          animation-play-state: paused;
        }
        .testimonial-marquee-card:hover {
          border-color: rgba(0, 240, 255, 0.4) !important;
          box-shadow: 0 10px 30px rgba(0, 240, 255, 0.15) !important;
          transform: translateY(-3px);
        }
        .marquee-fade-left, .marquee-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 120px;
          z-index: 3;
          pointer-events: none;
        }
        .marquee-fade-left {
          left: 0;
          background: linear-gradient(to right, #060b17 0%, transparent 100%);
        }
        .marquee-fade-right {
          right: 0;
          background: linear-gradient(to left, #060b17 0%, transparent 100%);
        }
      `}</style>

      {/* Header */}
      <div className="container-xl text-center mb-4">
        <span className="text-info fw-bold font-display" style={{ fontSize: '0.85rem', letterSpacing: '0.08em' }}>
          COMMUNITY VOICES • 10 TESTIMONIALS
        </span>
        <h2 className="text-white font-display fw-bold mb-2" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
          WHAT FRANCHISE MANAGERS SAY
        </h2>
        <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '620px', fontSize: '0.95rem' }}>
          Over 10,000+ bids placed across private multiplayer rooms and competitive draft nights. Hover to pause and read.
        </p>
      </div>

      {/* Single-Line Marquee Wrapper with side fade gradients */}
      <div className="position-relative marquee-container py-2">
        <div className="marquee-fade-left" />
        <div className="marquee-fade-right" />

        {/* Single continuous track containing all 10 testimonials duplicated for seamless infinite scroll */}
        <div className="marquee-track-single">
          {[...testimonials, ...testimonials].map((item, index) => (
            <TestimonialCard key={`marquee-${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialMarquee;
