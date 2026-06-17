import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const svgs = {
  'golden_egg.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#FFA500" stroke="#FF4500" stroke-width="5"/><circle cx="35" cy="35" r="15" fill="#FFFF00" opacity="0.8"/></svg>`,
  'power_egg.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#FF4500" stroke="#8B0000" stroke-width="4"/><circle cx="35" cy="35" r="10" fill="#FFA500" opacity="0.8"/></svg>`,
  'scale_bronze.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#cd7f32" stroke="#8b4513" stroke-width="4"/></svg>`,
  'scale_silver.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#C0C0C0" stroke="#808080" stroke-width="4"/></svg>`,
  'scale_gold.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#FFD700" stroke="#DAA520" stroke-width="4"/></svg>`,
  'boss_yokozuna.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" fill="#4B0082" stroke="#000" stroke-width="5"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#FFF" font-size="30" font-weight="bold" font-family="sans-serif">ヨコヅナ</text></svg>`,
  'boss_tatsu.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" fill="#2E8B57" stroke="#000" stroke-width="5"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#FFF" font-size="30" font-weight="bold" font-family="sans-serif">タツ</text></svg>`,
  'boss_joe.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" fill="#B22222" stroke="#000" stroke-width="5"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#FFF" font-size="30" font-weight="bold" font-family="sans-serif">ジョー</text></svg>`,
};

for (const [filename, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(IMAGE_DIR, filename), content);
  console.log(`Generated: ${filename}`);
}

console.log('Finished generating fallback SVGs.');
