import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.APP_URL || 'http://127.0.0.1:5174';
const outDir = 'screenshots/responsive';

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/${vp.name}.png`, fullPage: false });
  console.log(`captured ${vp.name}`);
  await page.close();
}

await browser.close();
