import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGE_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// Map local filenames to Inkipedia File page titles
const imagesToFetch = [
  { name: 'scale_bronze.png', title: 'File:S3_Icon_bronze_fish_scale.png', normalized: 'File:S3 Icon bronze fish scale.png' },
  { name: 'scale_silver.png', title: 'File:S3_Icon_silver_fish_scale.png', normalized: 'File:S3 Icon silver fish scale.png' },
  { name: 'scale_gold.png', title: 'File:S3_Icon_gold_fish_scale.png', normalized: 'File:S3 Icon gold fish scale.png' },
  { name: 'golden_egg.png', title: 'File:S3_Icon_Golden_Egg.png', normalized: 'File:S3 Icon Golden Egg.png' },
  { name: 'power_egg.png', title: 'File:S3_Icon_Power_Egg.png', normalized: 'File:S3 Icon Power Egg.png' },
  { name: 'boss_yokozuna.png', title: 'File:S3_Badge_Yokozuna.png', normalized: 'File:S3 Badge Yokozuna.png' },
  { name: 'boss_tatsu.png', title: 'File:S3_Badge_Horrorboros.png', normalized: 'File:S3 Badge Horrorboros.png' },
  { name: 'boss_joe.png', title: 'File:S3_Badge_Megalodontia.png', normalized: 'File:S3 Badge Megalodontia.png' }
];

async function main() {
  console.log('Fetching image URLs from Inkipedia API...');
  
  const titles = imagesToFetch.map(i => i.title).join('|');
  const apiUrl = `https://splatoonwiki.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const pages = data.query.pages;
    
    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.missing !== undefined) {
        console.warn(`[WARN] File not found on wiki: ${page.title}`);
        continue;
      }
      
      const imageUrl = page.imageinfo[0].url;
      const targetItem = imagesToFetch.find(i => i.normalized.toLowerCase() === page.title.toLowerCase());
      
      if (targetItem) {
        console.log(`Downloading ${targetItem.name} from ${imageUrl}...`);
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        fs.writeFileSync(path.join(IMAGE_DIR, targetItem.name), Buffer.from(buffer));
        console.log(`[SUCCESS] Saved ${targetItem.name}`);
      } else {
        console.log(`Could not find target item for ${page.title}`);
      }
    }
    console.log('All downloads completed!');
  } catch (error) {
    console.error('Error fetching from Inkipedia:', error);
  }
}

main();
