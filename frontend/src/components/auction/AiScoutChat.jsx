import React, { useState, useEffect, useRef } from 'react';
import { formatCrore } from '../../utils/formatters';

const AiScoutChat = ({ currentLot, userTeam, teams = [], allPlayers = [], onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome analysis when opened
  useEffect(() => {
    const teamName = userTeam?.name || 'Franchise';
    const purse = userTeam?.remainingPurse ? formatCrore(userTeam.remainingPurse) : '₹120.00 Cr';
    const squadCount = userTeam?.players?.length || 0;
    const remainingSlots = Math.max(0, (userTeam?.maxSquadSize || 25) - squadCount);

    setMessages([
      {
        id: 1,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Greetings, Boss! I am your AI Franchise Scout for ${teamName}. Current Purse: ${purse} (${remainingSlots} slots to fill). Ask me any strategic advice or tap the quick prompts below!`
      }
    ]);
  }, [userTeam]);

  // AI Tactical Analysis generator based on team state and current lot
  const generateScoutResponse = (query) => {
    const q = query.toLowerCase();
    const remainingPurse = userTeam?.remainingPurse || 1200000000;
    const squad = userTeam?.players || [];
    const overseasCount = squad.filter(p => p.player?.isOverseas).length;
    const overseasQuotaLeft = (userTeam?.maxOverseas || 8) - overseasCount;

    // Check positional composition
    const batters = squad.filter(p => p.player?.role === 'BATTER').length;
    const bowlers = squad.filter(p => p.player?.role === 'BOWLER').length;
    const allRounders = squad.filter(p => p.player?.role === 'ALL_ROUNDER').length;
    const keepers = squad.filter(p => p.player?.role === 'WICKET_KEEPER').length;

    if (q.includes('gap') || q.includes('need') || q.includes('weakness')) {
      const gaps = [];
      if (keepers < 2) gaps.push('Wicket-Keeper (recommend at least 2 in squad)');
      if (bowlers < 5) gaps.push('Specialist Bowlers (need minimum 5-6 pacers/spinners)');
      if (allRounders < 3) gaps.push('Pace/Spin All-Rounders for tactical balance');
      if (batters < 5) gaps.push('Specialist Batters to reinforce top order');
      if (overseasQuotaLeft <= 1) gaps.push('Overseas limit near ceiling; target Indian domestic talent!');

      if (gaps.length === 0) {
        return `Squad composition is looking exceptionally balanced! You have ${batters} Batters, ${bowlers} Bowlers, ${allRounders} All-Rounders, and ${keepers} Keepers. Target high-impact marquee enhancements or top uncapped value steals.`;
      }

      return `Tactical Squad Audit:\n• Immediate Needs: ${gaps.join('\n• ')}\n• Overseas Slots Remaining: ${overseasQuotaLeft}/8\n• Recommendation: Prioritize filling these core slots before chasing luxury picks.`;
    }

    if (q.includes('current') || q.includes('bid') || q.includes('should we')) {
      if (!currentLot) {
        return 'There is currently no active player under the hammer. Wait for the next lot to be announced!';
      }

      const player = currentLot;
      const isMarquee = player.category === 'MARQUEE';
      const maxBidLimit = Math.max(0, remainingPurse - (Math.max(0, 18 - squad.length - 1) * 2000000));

      if (player.isOverseas && overseasQuotaLeft <= 0) {
        return `⚠️ WARNING: We have already filled our overseas limit (8/8). We cannot bid for ${player.name} under official IPL rules.`;
      }

      if (maxBidLimit < player.basePrice) {
        return `⛔ BUDGET ALERT: We cannot afford ${player.name}'s base price of ${formatCrore(player.basePrice)} while preserving mandatory funds for the 18-player minimum squad quota.`;
      }

      const recommendedCeiling = isMarquee 
        ? Math.min(maxBidLimit, Math.max(player.basePrice * 1.5, 160000000))
        : Math.min(maxBidLimit, player.basePrice * 1.8);

      return `Scout Evaluation for ${player.name} (${player.role}, ${player.country}):\n• Role Fit: Strong match for our squad dynamics.\n• Suggested Bid Ceiling: Up to ${formatCrore(recommendedCeiling)}.\n• Tactical Tip: If bidding exceeds ${formatCrore(recommendedCeiling)}, step back to protect our purse for later sets!`;
    }

    if (q.includes('uncapped') || q.includes('emerging') || q.includes('steal')) {
      return `Top Uncapped Recommendations for Value-for-Money:\n• Mayank Yadav (156.7 km/h express pace)\n• Harshit Rana (death overs yorkers & variations)\n• Shashank Singh & Ashutosh Sharma (elite strike rate finishers)\n• Angkrish Raghuvanshi & Sameer Rizvi (top order power)\n• Suyash Sharma (mystery legspin). Target them in Set 6+!`;
    }

    if (q.includes('limit') || q.includes('ceiling') || q.includes('max')) {
      const minReserve = Math.max(0, 18 - squad.length - 1) * 2000000;
      const safeLimit = Math.max(0, remainingPurse - minReserve);
      return `Your Maximum Single Bid Power is ${formatCrore(safeLimit)}. This guarantees you preserve at least ₹20 Lakhs each for all remaining unfilled slots up to the mandatory 18-player minimum.`;
    }

    return `Strategic Advice for ${userTeam?.shortName || 'Team'}: Protect your purse for marquee fast bowlers and dynamic all-rounders. Keep an eye on RTM card opportunities when former stars come up!`;
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateScoutResponse(text);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="glass-card d-flex flex-column" style={{ height: '480px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
      {/* Scout Header */}
      <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between" style={{ background: 'rgba(0, 240, 255, 0.08)' }}>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-info text-dark" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
            <i className="bi bi-robot"></i>
          </div>
          <div>
            <h6 className="text-white font-display fw-bold mb-0">AI FRANCHISE SCOUT</h6>
            <span className="text-info" style={{ fontSize: '0.75rem' }}>Tactical General Manager Assistant</span>
          </div>
        </div>
        {onClose && (
          <button className="btn btn-sm btn-outline-secondary py-0 px-2 text-white" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`d-flex flex-column ${m.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}
          >
            <div
              className="p-2.5 rounded"
              style={{
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: '1.45',
                whiteSpace: 'pre-line',
                background: m.sender === 'user' ? '#0070f3' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              {m.text}
            </div>
            <span className="text-secondary mt-1" style={{ fontSize: '0.7rem' }}>
              {m.time}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="d-flex align-items-center gap-2 text-secondary small p-2">
            <span className="spinner-grow spinner-grow-sm text-info"></span>
            <span>Scout is analyzing squad data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-2 border-top border-secondary border-opacity-25 d-flex gap-1.5 overflow-x-auto" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
        <button
          className="btn btn-sm btn-outline-info text-nowrap py-1 px-2.5"
          style={{ fontSize: '0.75rem' }}
          onClick={() => handleSendMessage('Analyze our squad gaps')}
        >
          🔍 Squad Gaps
        </button>
        <button
          className="btn btn-sm btn-outline-info text-nowrap py-1 px-2.5"
          style={{ fontSize: '0.75rem' }}
          onClick={() => handleSendMessage('Should we bid for the current player?')}
        >
          🎯 Bid on Current Player?
        </button>
        <button
          className="btn btn-sm btn-outline-info text-nowrap py-1 px-2.5"
          style={{ fontSize: '0.75rem' }}
          onClick={() => handleSendMessage('What is our safe maximum bid ceiling?')}
        >
          💰 Max Bid Ceiling
        </button>
        <button
          className="btn btn-sm btn-outline-info text-nowrap py-1 px-2.5"
          style={{ fontSize: '0.75rem' }}
          onClick={() => handleSendMessage('Recommend top available uncapped players')}
        >
          🌟 Uncapped Steals
        </button>
      </div>

      {/* Input Box */}
      <div className="p-2.5 border-top border-secondary border-opacity-25">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="d-flex gap-2"
        >
          <input
            type="text"
            className="form-control form-control-dark form-control-sm"
            placeholder="Ask AI Scout tactical advice..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-primary px-3" disabled={!inputText.trim()}>
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiScoutChat;
