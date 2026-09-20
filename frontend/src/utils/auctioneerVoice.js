// Zero-dependency Speech Synthesis Auctioneer Voice Commentary Engine
let voiceEnabled = true;
let voiceVolume = 0.85;
let voiceRate = 1.05;
let voicePitch = 1.0;
let selectedVoice = null;

const initVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const load = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer clear English accents suited for cricket broadcasting
    selectedVoice =
      voices.find((v) => v.lang === 'en-IN') ||
      voices.find((v) => v.lang === 'en-GB' || v.name.includes('UK') || v.name.includes('British')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];
  };

  load();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = load;
  }
};

if (typeof window !== 'undefined') {
  initVoices();
}

export const isVoiceEnabled = () => voiceEnabled;

export const toggleVoice = () => {
  voiceEnabled = !voiceEnabled;
  if (!voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  return voiceEnabled;
};

export const setVoiceVolume = (val) => {
  voiceVolume = Math.max(0, Math.min(1, val));
};

export const getVoiceVolume = () => voiceVolume;

// Format numbers into natural spoken cricket auction speech
export const formatSpokenAmount = (amount) => {
  if (!amount || isNaN(amount)) return 'zero';
  const num = Number(amount);
  if (num >= 10000000) {
    const cr = num / 10000000;
    const rounded = Math.round(cr * 100) / 100;
    const lakhPart = Math.round((cr % 1) * 100);
    const wholeCr = Math.floor(cr);
    if (lakhPart > 0) {
      return `${wholeCr} Crore ${lakhPart} Lakhs`;
    }
    return `${rounded} Crore${rounded === 1 ? '' : 's'}`;
  }
  if (num >= 100000) {
    const lakhs = Math.round(num / 100000);
    return `${lakhs} Lakhs`;
  }
  return `${num} rupees`;
};

// Internal speech queue dispatcher with clean interruption for new bids
const speak = (text, priority = false) => {
  if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    if (priority) {
      window.speechSynthesis.cancel(); // Interrupt stale callouts for instant live bid feedback
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.volume = voiceVolume;
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Autoplay or browser policy silence
  }
};

export const auctioneerVoice = {
  // Opening player announcement
  announcePlayer: (player) => {
    if (!player) return;
    const roleText = player.role ? player.role.toLowerCase().replace('_', ' ') : 'cricketer';
    const text = `Now on the auction block: ${player.name}. ${player.country} ${roleText}. Base price: ${formatSpokenAmount(player.basePrice)}.`;
    speak(text, true);
  },

  // Bid Callout
  announceBid: (teamName, amount) => {
    if (!teamName || !amount) return;
    const phrases = [
      `${formatSpokenAmount(amount)} from ${teamName}!`,
      `${teamName} raises the paddle to ${formatSpokenAmount(amount)}!`,
      `New bid: ${formatSpokenAmount(amount)}, ${teamName} leads!`
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    speak(phrase, true);
  },

  // Countdown Urgency Warnings
  announceWarning: (seconds, amount, teamName) => {
    if (!amount) return;
    if (seconds === 10) {
      speak(`Going once at ${formatSpokenAmount(amount)}... Any more bids?`);
    } else if (seconds === 5) {
      speak(`Going twice at ${formatSpokenAmount(amount)} to ${teamName || 'the leading franchise'}!`);
    }
  },

  // Hammer Fall / Sold Callout
  announceSold: (playerName, teamName, amount) => {
    speak(`SOLD! ${playerName} goes to ${teamName} for ${formatSpokenAmount(amount)}! Congratulations!`, true);
  },

  // Unsold Callout
  announceUnsold: (playerName) => {
    speak(`${playerName} is UNSOLD at this stage.`, true);
  },

  // RTM Alert Callout
  announceRTM: (teamName, playerName, amount) => {
    speak(`Right to Match opportunity! ${teamName} can match ${formatSpokenAmount(amount)} for ${playerName}!`, true);
  },

  // Custom phrase
  announceCustom: (text, priority = false) => {
    speak(text, priority);
  }
};

export default auctioneerVoice;
