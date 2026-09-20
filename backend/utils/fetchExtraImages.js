const https = require('https');
const fs = require('fs');
const path = require('path');

const candidates = [
  'Heinrich Klaasen', 'Nicholas Pooran', 'Liam Livingstone', 'Anrich Nortje',
  'Varun Chakravarthy', 'Rinku Singh', 'Sai Sudharsan', 'Abhishek Sharma',
  'Harshit Rana', 'Mayank Yadav', 'Riyan Parag', 'Dhruv Jurel',
  'Jitesh Sharma', 'Prabhsimran Singh'
];

async function checkOneByOne() {
  const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'playerImagesMap.json')));
  
  for (const name of candidates) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + ' cricketer')}&format=json`;
      const searchRes = await new Promise((res) => {
        https.get(searchUrl, { headers: { 'User-Agent': 'AuctionX/1.0' } }, (r) => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => {
            try { res(JSON.parse(d)); } catch { res(null); }
          });
        }).on('error', () => res(null));
      });

      const title = searchRes?.query?.search?.[0]?.title;
      if (title) {
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600`;
        const imgRes = await new Promise((res) => {
          https.get(imgUrl, { headers: { 'User-Agent': 'AuctionX/1.0' } }, (r) => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => {
              try { res(JSON.parse(d)); } catch { res(null); }
            });
          }).on('error', () => res(null));
        });

        const pages = imgRes?.query?.pages || {};
        for (const pid of Object.keys(pages)) {
          if (pages[pid].thumbnail?.source) {
            existing[name] = pages[pid].thumbnail.source;
            console.log(`Found for ${name} -> ${title}`);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'playerImagesMap.json'), JSON.stringify(existing, null, 2));
  console.log('Total players in map now:', Object.keys(existing).length);
}

checkOneByOne();
