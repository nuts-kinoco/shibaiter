import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// 予測される画像のリスト (Leanny氏のURL構造に基づく)
// splat3/images/coopItem/ または coopEnemy/
const imagesToFetch = [
  // イクラ類
  { name: 'golden_egg.png', url: 'https://leanny.github.io/splat3/images/coopItem/GoldenIkura.png' },
  { name: 'power_egg.png', url: 'https://leanny.github.io/splat3/images/coopItem/Ikura.png' },
  // ウロコ
  { name: 'scale_bronze.png', url: 'https://leanny.github.io/splat3/images/coopItem/CoopScale_Bronze.png' },
  { name: 'scale_silver.png', url: 'https://leanny.github.io/splat3/images/coopItem/CoopScale_Silver.png' },
  { name: 'scale_gold.png', url: 'https://leanny.github.io/splat3/images/coopItem/CoopScale_Gold.png' },
  // オカシラ
  { name: 'boss_yokozuna.png', url: 'https://leanny.github.io/splat3/images/coopEnemy/SakeBig.png' },
  { name: 'boss_tatsu.png', url: 'https://leanny.github.io/splat3/images/coopEnemy/Tatsu.png' },
  { name: 'boss_joe.png', url: 'https://leanny.github.io/splat3/images/coopEnemy/Donsuko.png' },
];

async function downloadImage(image) {
  try {
    const res = await fetch(image.url);
    if (!res.ok) {
      console.warn(`[WARN] Failed to fetch ${image.name} from ${image.url}: ${res.status} ${res.statusText}`);
      // GitHubの生ファイルパスもフォールバックとして試す
      const rawUrl = `https://raw.githubusercontent.com/Leanny/splat3/main/images/coopItem/${image.url.split('/').pop()}`;
      console.log(`Retrying with raw GitHub URL: ${rawUrl}`);
      const res2 = await fetch(rawUrl);
      if (!res2.ok) {
        console.warn(`[WARN] Fallback failed for ${image.name}`);
        return;
      }
      const buffer = await res2.arrayBuffer();
      fs.writeFileSync(path.join(IMAGE_DIR, image.name), Buffer.from(buffer));
      console.log(`[SUCCESS] Downloaded: ${image.name} (from fallback)`);
      return;
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(path.join(IMAGE_DIR, image.name), Buffer.from(buffer));
    console.log(`[SUCCESS] Downloaded: ${image.name}`);
  } catch (error) {
    console.error(`[ERROR] Error downloading ${image.name}:`, error);
  }
}

async function main() {
  console.log('Starting image download...');
  for (const image of imagesToFetch) {
    await downloadImage(image);
  }
  console.log('Finished image download.');
}

main();
