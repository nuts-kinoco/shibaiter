import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGE_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const imagesToFetch = [
  { name: 'scale_bronze.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/4/4e/S3_Icon_Bronze_Scale.png' },
  { name: 'scale_silver.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/6/65/S3_Icon_Silver_Scale.png' },
  { name: 'scale_gold.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/2/23/S3_Icon_Gold_Scale.png' },
  { name: 'golden_egg.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/0/00/S3_Icon_Golden_Egg.png' },
  { name: 'power_egg.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/1/1a/S3_Icon_Power_Egg.png' },
  { name: 'boss_yokozuna.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/7/7b/S3_Badge_Yokozuna.png' },
  { name: 'boss_tatsu.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/9/9d/S3_Badge_Horrorboros.png' },
  { name: 'boss_joe.png', url: 'https://cdn.wikimg.net/en/splatoonwiki/images/6/62/S3_Badge_Megalodontia.png' }
];

async function main() {
  for (const image of imagesToFetch) {
    try {
      const res = await fetch(image.url);
      if (!res.ok) {
        console.warn(`Failed: ${image.name} ${res.status}`);
        continue;
      }
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(path.join(IMAGE_DIR, image.name), Buffer.from(buffer));
      console.log(`Success: ${image.name}`);
    } catch (e) {
      console.error(`Error ${image.name}:`, e);
    }
  }
}
main();
