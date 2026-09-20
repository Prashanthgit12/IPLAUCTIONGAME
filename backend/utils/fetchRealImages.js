const https = require('https');
const fs = require('fs');
const path = require('path');

const players = [
  'Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Jasprit Bumrah', 'Hardik Pandya',
  'Suryakumar Yadav', 'Rishabh Pant', 'Pat Cummins', 'Mitchell Starc', 'Rashid Khan',
  'Travis Head', 'Heinrich Klaasen', 'Sunil Narine', 'Andre Russell', 'Glenn Maxwell',
  'Jos Buttler', 'Trent Boult', 'Kagiso Rabada', 'Shubman Gill', 'Yashasvi Jaiswal',
  'KL Rahul', 'Shreyas Iyer', 'Ravindra Jadeja', 'Mohammed Shami', 'Arshdeep Singh',
  'Kuldeep Yadav', 'Yuzvendra Chahal', 'Rinku Singh', 'Shivam Dube', 'Axar Patel',
  'Sanju Samson', 'Ishan Kishan', 'Mohammed Siraj', 'David Warner (cricketer)', 'Faf du Plessis',
  'Quinton de Kock', 'Nicholas Pooran', 'Liam Livingstone', 'Sam Curran', 'Marcus Stoinis',
  'Lockie Ferguson', 'Anrich Nortje', 'Bhuvneshwar Kumar', 'T. Natarajan', 'Varun Chakravarthy',
  'Washington Sundar', 'Tilak Varma', 'Ruturaj Gaikwad', 'Sai Sudharsan', 'Abhishek Sharma (cricketer, born 2000)',
  'Harshit Rana', 'Mayank Yadav', 'Nitish Kumar Reddy', 'Riyan Parag', 'Dhruv Jurel'
];

function fetchImagesForBatch(batch) {
  return new Promise((resolve, reject) => {
    const titles = batch.map(p => encodeURIComponent(p.replace(/ /g, '_'))).join('|');
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=pageimages&format=json&pithumbsize=600`;

    https.get(url, { headers: { 'User-Agent': 'AuctionXPlatform/1.0 (cricket-auction-bot)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages || {};
          const results = {};
          for (const key of Object.keys(pages)) {
            const page = pages[key];
            if (page.thumbnail?.source) {
              results[page.title] = page.thumbnail.source;
            }
          }
          resolve(results);
        } catch (e) {
          resolve({});
        }
      });
    }).on('error', err => resolve({}));
  });
}

async function run() {
  console.log('Fetching images for 55 players...');
  const batch1 = players.slice(0, 20);
  const batch2 = players.slice(20, 40);
  const batch3 = players.slice(40);

  const res1 = await fetchImagesForBatch(batch1);
  const res2 = await fetchImagesForBatch(batch2);
  const res3 = await fetchImagesForBatch(batch3);

  const allImages = { ...res1, ...res2, ...res3 };
  console.log(`Fetched images for ${Object.keys(allImages).length} players.`);
  fs.writeFileSync(path.join(__dirname, 'playerImagesMap.json'), JSON.stringify(allImages, null, 2));
}

run();
