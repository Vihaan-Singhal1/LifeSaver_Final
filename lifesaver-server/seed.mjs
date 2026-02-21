// lifesaver-server/seed.mjs
// ESM script. Seeds 5 sample reports near Seattle into data/db.json.

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import ngeohash from 'ngeohash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, 'data');
const uploadsDir = path.resolve(__dirname, 'uploads');
const dbPath = path.join(dataDir, 'db.json');

// --- helpers ---
function metersBetween(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function scoreReport(a, nearbySimilarCount = 0, hasContact = true) {
  let s = 0;
  if (a.breathing || a.bleeding) s += 4;
  if (a.trapped) s += 3;
  if (a.water || a.fire) s += 3;
  if (a.vulnerable) s += 2;
  if (a.alone) s += 1;
  if (!hasContact) s += 1;
  if (nearbySimilarCount >= 2) s += 2;
  const urgency = s >= 9 ? 'critical' : s >= 6 ? 'high' : s >= 3 ? 'medium' : 'low';
  return { score: s, urgency };
}

function geohashFor(lat, lng, precision = 7) {
  return ngeohash.encode(lat, lng, precision);
}

async function ensureDir(p) {
  try { await fs.mkdir(p, { recursive: true }); } catch {}
}

async function readDb() {
  try {
    const raw = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { reports: [] };
  }
}

async function writeDb(obj) {
  await ensureDir(dataDir);
  await fs.writeFile(dbPath, JSON.stringify(obj, null, 2));
}

// --- seed logic ---
async function main() {
  await ensureDir(dataDir);
  await ensureDir(uploadsDir);

  // center on Seattle
  const center = { lat: 47.6062, lng: -122.3321 };

  // small random jitter around center
  const jitter = (meters) => {
    // approx conversions near Seattle
    const dLat = (meters / 111320) * (Math.random() > 0.5 ? 1 : -1);
    const dLng = (meters / (111320 * Math.cos((center.lat * Math.PI) / 180))) * (Math.random() > 0.5 ? 1 : -1);
    return { dLat, dLng };
  };

  const now = Date.now();
  const base = await readDb();
  base.reports = base.reports || [];

  const draft = [];

  const scenarios = [
    {
      categories: ['Flooded', 'Trapped'],
      answers: { breathing: false, bleeding: false, trapped: true, water: true, fire: false, vulnerable: true, alone: false },
      text: 'Basement flooding; person trapped with limited mobility.',
      contact: 'seeder@example.com'
    },
    {
      categories: ['Medical'],
      answers: { breathing: true, bleeding: false, trapped: false, water: false, fire: false, vulnerable: false, alone: true },
      text: 'Breathing difficulty reported.',
      contact: ''
    },
    {
      categories: ['Fire'],
      answers: { breathing: false, bleeding: false, trapped: false, water: false, fire: true, vulnerable: true, alone: false },
      text: 'Smoke and small fire in apartment hallway.',
      contact: 'contact@example.com'
    },
    {
      categories: ['Supply need'],
      answers: { breathing: false, bleeding: false, trapped: false, water: false, fire: false, vulnerable: true, alone: true },
      text: 'Elderly resident needs medication and water.',
      contact: ''
    },
    {
      categories: ['Missing person'],
      answers: { breathing: false, bleeding: false, trapped: false, water: true, fire: false, vulnerable: true, alone: false },
      text: 'Child separated from family near flooded street.',
      contact: 'parent@example.com'
    }
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const j = jitter(300 + Math.random() * 700); // 300–1000m
    const lat = center.lat + j.dLat;
    const lng = center.lng + j.dLng;

    // crude "nearby similar" count among already staged items
    const similar = draft.filter(r => r.categories.some(c => s.categories.includes(c)) &&
      metersBetween(r.lat, r.lng, lat, lng) <= 200 &&
      (now - new Date(r.createdAt).getTime()) <= 30 * 60 * 1000).length;

    const { score, urgency } = scoreReport(s.answers, similar, !!s.contact);

    const createdAt = new Date(now - Math.floor(Math.random() * 45) * 60 * 1000).toISOString();

    draft.push({
      id: uuid(),
      createdAt,
      updatedAt: createdAt,
      lat,
      lng,
      geohash: geohashFor(lat, lng, 7),
      categories: s.categories,
      answers: s.answers,
      text: s.text,
      photoUrl: null,        // drop a file in /uploads and set this later if you want
      contact: s.contact || null,
      score,
      urgency,               // 'low' | 'medium' | 'high' | 'critical'
      status: 'new',
      assignedTo: null,
      duplicateOf: null
    });
  }

  // Optional backup if an existing DB is present
  try {
    const stat = await fs.stat(dbPath);
    if (stat.isFile()) {
      const backup = dbPath.replace(/\.json$/, `.backup.${Date.now()}.json`);
      await fs.copyFile(dbPath, backup);
      console.log(`Backed up existing DB to ${backup}`);
    }
  } catch {}

  await writeDb({ reports: draft });
  console.log(`Seeded ${draft.length} reports into ${dbPath}`);
  console.log(`Tip: add images to ${uploadsDir} and set photoUrl on specific reports if desired.`);
}

main().catch(e => {
  if (e.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('A module is missing. Run `npm install` inside lifesaver-server, then try `npm run seed` again.');
  } else {
    console.error(e);
  }
  process.exit(1);
});
