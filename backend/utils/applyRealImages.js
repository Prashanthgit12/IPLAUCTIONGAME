const fs = require('fs');
const path = require('path');

const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'playerImagesMap.json'), 'utf8'));

// Aliases
map['David Warner'] = map['David Warner (cricketer)'] || map['David Warner'];
map['T Natarajan'] = map['T. Natarajan'] || map['T Natarajan'];

// Additional direct real cricket images
const additional = {
  'Heinrich Klaasen': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Heinrich_Klaasen_2019_Boxing_Day_%28cropped%29.jpg',
  'Nicholas Pooran': 'https://upload.wikimedia.org/wikipedia/commons/6/62/Nicholas_Pooran_in_2019.jpg',
  'Liam Livingstone': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Liam_Livingstone_2022.jpg',
  'Anrich Nortje': 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Anrich_Nortje_2019_Boxing_Day_%28cropped%29.jpg',
  'Varun Chakaravarthy': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Varun_Chakravarthy.jpg',
  'Varun Chakravarthy': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Varun_Chakravarthy.jpg',
  'Rinku Singh': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Rinku_Singh_2023.jpg',
  'Riyan Parag': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Riyan_Parag_in_2024.jpg',
  'Dhruv Jurel': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Dhruv_Jurel_in_2024.jpg',
  'Abhishek Sharma': 'https://upload.wikimedia.org/wikipedia/commons/7/75/Abhishek_Sharma_cricketer.jpg',
  'Harshit Rana': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Harshit_Rana.jpg',
  'Mayank Yadav': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Mayank_Yadav_pace.jpg',
  'Phil Salt': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Phil_Salt_in_2022.jpg',
  'Will Jacks': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Will_Jacks_2023.jpg',
  'Jitesh Sharma': 'https://upload.wikimedia.org/wikipedia/commons/5/52/Jitesh_Sharma_2023.jpg',
  'Prabhsimran Singh': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Prabhsimran_Singh.jpg',
  'Sai Sudharsan': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Sai_Sudharsan_in_2023.jpg'
};

Object.assign(map, additional);

const seedPath = path.join(__dirname, 'seedData.js');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// For each player name, replace image
let count = 0;
for (const [name, imgUrl] of Object.entries(map)) {
  if (!imgUrl) continue;
  // Clean url
  const cleanUrl = imgUrl.split('?')[0];
  // Regex to find player object block and replace its image
  const regex = new RegExp(`(name:\\s*['"]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][\\s\\S]*?image:\\s*['"])([^'"]+)(['"])`);
  if (regex.test(seedContent)) {
    seedContent = seedContent.replace(regex, `$1${cleanUrl}$3`);
    count++;
  }
}

console.log(`Updated images for ${count} players in seedData.js`);
fs.writeFileSync(seedPath, seedContent, 'utf8');
