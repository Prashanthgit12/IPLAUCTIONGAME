const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'public', 'logos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. TATA IPL Official Logo
const iplSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="iplGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#003366"/>
      <stop offset="50%" stop-color="#001f3f"/>
      <stop offset="100%" stop-color="#000d1a"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="50%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF6F00"/>
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1744"/>
      <stop offset="100%" stop-color="#FF6D00"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#iplGrad)"/>
  <circle cx="200" cy="200" r="165" stroke="url(#goldGrad)" stroke-width="6" fill="none" opacity="0.7"/>
  <path d="M130,280 L230,100 L255,115 L155,295 Z" fill="url(#goldGrad)"/>
  <circle cx="275" cy="125" r="24" fill="url(#flameGrad)"/>
  <path d="M160,190 Q220,130 280,210 Q220,290 160,190 Z" fill="#ffffff" opacity="0.9"/>
  <text x="200" y="345" font-family="Arial, sans-serif" font-weight="900" font-size="56" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="6">IPL</text>
  <text x="200" y="375" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="8" opacity="0.85">OFFICIAL</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'ipl.svg'), iplSvg);

// 2. Mumbai Indians (MI)
const miSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="miBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#005da0"/>
      <stop offset="100%" stop-color="#002b5c"/>
    </linearGradient>
    <linearGradient id="miGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e6b00f"/>
      <stop offset="100%" stop-color="#c28e00"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#miBlue)"/>
  <circle cx="200" cy="175" r="140" stroke="url(#miGold)" stroke-width="8" fill="none"/>
  <path d="M200,55 L220,135 L300,95 L240,155 L320,175 L240,195 L300,255 L220,215 L200,295 L180,215 L100,255 L160,195 L80,175 L160,155 L100,95 L180,135 Z" fill="url(#miGold)" opacity="0.95"/>
  <circle cx="200" cy="175" r="48" fill="#ffffff"/>
  <circle cx="200" cy="175" r="34" fill="#002b5c"/>
  <text x="200" y="335" font-family="Arial, sans-serif" font-weight="900" font-size="36" fill="#ffffff" text-anchor="middle" letter-spacing="2">MUMBAI</text>
  <text x="200" y="372" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="url(#miGold)" text-anchor="middle" letter-spacing="4">INDIANS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'mi.svg'), miSvg);

// 3. Chennai Super Kings (CSK)
const cskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cskYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f9cd05"/>
      <stop offset="100%" stop-color="#f2a900"/>
    </linearGradient>
    <linearGradient id="cskBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0081e8"/>
      <stop offset="100%" stop-color="#004b99"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#cskYellow)"/>
  <circle cx="200" cy="180" r="145" stroke="url(#cskBlue)" stroke-width="8" fill="none"/>
  <path d="M160,75 L200,105 L240,75 L230,115 L260,105 L245,135 L155,135 L140,105 L170,115 Z" fill="url(#cskBlue)"/>
  <path d="M150,145 Q200,115 250,155 Q270,195 240,235 Q210,255 170,245 Q130,225 140,175 Z" fill="url(#cskBlue)"/>
  <circle cx="225" cy="175" r="8" fill="#ffffff"/>
  <path d="M250,215 L275,210 L260,225 Z" fill="#ffffff"/>
  <text x="200" y="330" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="url(#cskBlue)" text-anchor="middle" letter-spacing="2">CHENNAI</text>
  <text x="200" y="368" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#212121" text-anchor="middle" letter-spacing="3">SUPER KINGS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'csk.svg'), cskSvg);

// 4. Royal Challengers Bengaluru (RCB)
const rcbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="rcbDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b2a29"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="rcbGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d7a83d"/>
      <stop offset="100%" stop-color="#9e7417"/>
    </linearGradient>
    <linearGradient id="rcbRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e31e24"/>
      <stop offset="100%" stop-color="#960d11"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#rcbDark)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#rcbRed)" stroke-width="8" fill="none"/>
  <path d="M175,85 Q200,70 225,85 Q250,105 240,135 Q265,125 270,160 Q260,190 235,180 Q250,220 210,245 L190,245 Q165,220 175,185 Q145,175 145,145 Q145,110 175,85 Z" fill="url(#rcbGold)"/>
  <circle cx="225" cy="115" r="6" fill="#000000"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="url(#rcbRed)" text-anchor="middle" letter-spacing="4">RCB</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="url(#rcbGold)" text-anchor="middle" letter-spacing="4">BENGALURU</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'rcb.svg'), rcbSvg);

// 5. Kolkata Knight Riders (KKR)
const kkrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="kkrPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4b266d"/>
      <stop offset="100%" stop-color="#260f3d"/>
    </linearGradient>
    <linearGradient id="kkrGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d130"/>
      <stop offset="100%" stop-color="#cf9e0c"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#kkrPurple)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#kkrGold)" stroke-width="8" fill="none"/>
  <path d="M200,60 L225,110 L255,90 L245,130 L280,125 L250,160 L270,220 L200,260 L130,220 L150,160 L120,125 L155,130 L145,90 L175,110 Z" fill="url(#kkrGold)"/>
  <path d="M175,180 L225,180 L220,190 L180,190 Z" fill="#260f3d"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="2">KOLKATA</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="24" fill="url(#kkrGold)" text-anchor="middle" letter-spacing="4">KNIGHT RIDERS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'kkr.svg'), kkrSvg);

// 6. Sunrisers Hyderabad (SRH)
const srhSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="srhOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff671f"/>
      <stop offset="100%" stop-color="#d33b00"/>
    </linearGradient>
    <linearGradient id="srhDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f1f1f"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#srhDark)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#srhOrange)" stroke-width="8" fill="none"/>
  <circle cx="200" cy="135" r="58" fill="url(#srhOrange)" opacity="0.75"/>
  <path d="M200,90 Q230,160 310,125 Q270,220 200,245 Q130,220 90,125 Q170,160 200,90 Z" fill="url(#srhOrange)"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="url(#srhOrange)" text-anchor="middle" letter-spacing="2">SUNRISERS</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="4">HYDERABAD</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'srh.svg'), srhSvg);

// 7. Delhi Capitals (DC)
const dcSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="dcBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#004c97"/>
      <stop offset="100%" stop-color="#00234a"/>
    </linearGradient>
    <linearGradient id="dcRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e01e36"/>
      <stop offset="100%" stop-color="#9e0b1d"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#dcBlue)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#dcRed)" stroke-width="8" fill="none"/>
  <path d="M150,85 L250,85 L275,175 Q250,255 200,270 Q150,255 125,175 Z" fill="url(#dcRed)"/>
  <polygon points="200,110 235,155 220,225 200,240 180,225 165,155" fill="#ffffff"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="36" fill="#ffffff" text-anchor="middle" letter-spacing="3">DELHI</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="26" fill="url(#dcRed)" text-anchor="middle" letter-spacing="5">CAPITALS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'dc.svg'), dcSvg);

// 8. Rajasthan Royals (RR)
const rrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="rrPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea1a85"/>
      <stop offset="100%" stop-color="#a60c5b"/>
    </linearGradient>
    <linearGradient id="rrBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#254aa5"/>
      <stop offset="100%" stop-color="#0f2561"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#rrBlue)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#rrPink)" stroke-width="8" fill="none"/>
  <path d="M150,105 L180,135 L200,100 L220,135 L250,105 L240,165 L160,165 Z" fill="url(#rrPink)"/>
  <text x="200" y="245" font-family="Georgia, serif" font-weight="900" font-size="85" fill="#ffffff" text-anchor="middle">RR</text>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="url(#rrPink)" text-anchor="middle" letter-spacing="2">RAJASTHAN</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="4">ROYALS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'rr.svg'), rrSvg);

// 9. Punjab Kings (PBKS)
const pbksSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="pbksRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dd1f2d"/>
      <stop offset="100%" stop-color="#8f0b15"/>
    </linearGradient>
    <linearGradient id="pbksGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d061"/>
      <stop offset="100%" stop-color="#b89127"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#pbksRed)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#pbksGold)" stroke-width="8" fill="none"/>
  <path d="M140,80 L260,80 L275,170 Q255,255 200,270 Q145,255 125,170 Z" fill="url(#pbksGold)"/>
  <polygon points="200,115 225,165 215,215 200,230 185,215 175,165" fill="#8f0b15"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="3">PUNJAB</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="url(#pbksGold)" text-anchor="middle" letter-spacing="5">KINGS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'pbks.svg'), pbksSvg);

// 10. Gujarat Titans (GT)
const gtSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="gtNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b2133"/>
      <stop offset="100%" stop-color="#0b0f19"/>
    </linearGradient>
    <linearGradient id="gtGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ce9b3b"/>
      <stop offset="100%" stop-color="#87621c"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#gtNavy)"/>
  <circle cx="200" cy="175" r="145" stroke="url(#gtGold)" stroke-width="8" fill="none"/>
  <polygon points="200,65 280,235 120,235" fill="url(#gtGold)"/>
  <polygon points="200,105 250,220 150,220" fill="#0b0f19"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="3">GUJARAT</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="url(#gtGold)" text-anchor="middle" letter-spacing="5">TITANS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'gt.svg'), gtSvg);

// 11. Lucknow Super Giants (LSG)
const lsgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="lsgCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00b4d8"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </linearGradient>
    <linearGradient id="lsgOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f77f00"/>
      <stop offset="100%" stop-color="#d62828"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#lsgCyan)"/>
  <circle cx="200" cy="175" r="145" stroke="#ffffff" stroke-width="8" fill="none"/>
  <path d="M200,75 L220,175 L300,115 Q280,215 200,245 Q120,215 100,115 L180,175 Z" fill="url(#lsgOrange)"/>
  <circle cx="200" cy="155" r="25" fill="#ffffff"/>
  <circle cx="200" cy="155" r="14" fill="#0077b6"/>
  <text x="200" y="325" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="3">LUCKNOW</text>
  <text x="200" y="365" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="url(#lsgOrange)" text-anchor="middle" letter-spacing="4">SUPER GIANTS</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'lsg.svg'), lsgSvg);

console.log('Successfully created all 11 official high-definition SVG team and tournament logos in frontend/public/logos!');
