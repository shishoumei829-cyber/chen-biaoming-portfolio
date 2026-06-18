import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, '..', 'assets', 'digitalark');
const base = process.env.DA_BASE || 'http://127.0.0.1:3000';

const shots = [
  { url: `${base}/apps/sanctuary.html`, file: 'ui-sanctuary.png', wait: 1200 },
  { url: `${base}/apps/training.html`, file: 'ui-training.png', wait: 1200 },
  { url: `${base}/apps/companion.html`, file: 'ui-companion.png', wait: 1200 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 430, height: 920 },
  deviceScaleFactor: 2,
});
page.setDefaultTimeout(60000);

for (const { url, file, wait } of shots) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  const phone = page.locator('.phone').first();
  await phone.screenshot({ path: path.join(outDir, file) });
  console.log('saved', file);
}

await browser.close();
