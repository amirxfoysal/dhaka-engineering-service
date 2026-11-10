import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.APP_URL || 'http://127.0.0.1:5174';
const outDir = 'screenshots';

const routes = [
  { name: '01-home', path: '/' },
  { name: '02-service-details', path: '/services/ac' },
  { name: '03-booking', path: '/book' },
  { name: '04-my-booking', path: '/bookings' },
  { name: '05-profile', path: '/profile' },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

for (const route of routes) {
  await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${outDir}/${route.name}.png`,
    fullPage: false,
  });
  console.log(`captured ${route.name}`);
}

await browser.close();
