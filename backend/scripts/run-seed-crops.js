/**
 * run-seed-crops.js
 * Seed/update crops table via direct pg connection.
 * Run: node scripts/run-seed-crops.js
 */
const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.umydaqwlkpgomtjbmvxj:%40Aditya1611@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

// ── ALWAYS UPDATE: Wheat and Rice (existing rows, stale 2024-25 rates) ────────
// Rabi 2026-27 (CCEA approval: 1 Oct 2025) / Kharif 2026-27 (CCEA: 13 May 2026)
const ALWAYS_UPDATE = [
  { name: 'Wheat', msp_rate: 2585, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Rice',  msp_rate: 2441, unit: 'quintal', season: 'Kharif 2026-27' },
];

// ── INSERT IF NOT EXISTS (new crops) ─────────────────────────────────────────
const NEW_CROPS = [
  // Rabi 2026-27
  { name: 'Barley',             msp_rate: 2150, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Gram (Chana)',       msp_rate: 5875, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Lentil (Masur)',     msp_rate: 7000, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Rapeseed & Mustard', msp_rate: 6200, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Safflower',          msp_rate: 6540, unit: 'quintal', season: 'Rabi 2026-27' },
  // Kharif 2026-27
  { name: 'Paddy (Common)',     msp_rate: 2441, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Paddy (Grade A)',    msp_rate: 2461, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Bajra',              msp_rate: 2900, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Maize',              msp_rate: 2410, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Jowar (Hybrid)',     msp_rate: 4023, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Jowar (Maldandi)',   msp_rate: 4073, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Ragi',               msp_rate: 5205, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Tur (Arhar)',        msp_rate: 8450, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Moong',              msp_rate: 8780, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Urad',               msp_rate: 8200, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Groundnut',          msp_rate: 7517, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Soybean (Yellow)',   msp_rate: 5708, unit: 'quintal', season: 'Kharif 2026-27' },
  // 2026-27 not yet verified — using 2025-26 CCEA figures
  { name: 'Sunflower Seed',           msp_rate: 7580, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
  { name: 'Sesamum',                  msp_rate: 9267, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
  { name: 'Cotton (Medium Staple)',   msp_rate: 7710, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
  { name: 'Cotton (Long Staple)',     msp_rate: 8110, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.\n');

  const summary = [];

  // Step 1: Update Wheat and Rice (force-update regardless of current value)
  for (const crop of ALWAYS_UPDATE) {
    const existing = await client.query('SELECT id, msp_rate FROM crops WHERE name = $1', [crop.name]);
    if (existing.rows.length > 0) {
      const prev = existing.rows[0].msp_rate;
      await client.query('UPDATE crops SET msp_rate = $1, unit = $2 WHERE name = $3', [crop.msp_rate, crop.unit, crop.name]);
      summary.push({ name: crop.name, msp: crop.msp_rate, season: crop.season, status: prev != crop.msp_rate ? `UPDATED (was ${prev})` : 'already current' });
    } else {
      await client.query('INSERT INTO crops (name, msp_rate, unit) VALUES ($1, $2, $3)', [crop.name, crop.msp_rate, crop.unit]);
      summary.push({ name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'INSERTED (was missing)' });
    }
  }

  // Step 2: Insert new crops (skip if name already exists)
  for (const crop of NEW_CROPS) {
    const existing = await client.query('SELECT id FROM crops WHERE name = $1', [crop.name]);
    if (existing.rows.length === 0) {
      await client.query('INSERT INTO crops (name, msp_rate, unit) VALUES ($1, $2, $3)', [crop.name, crop.msp_rate, crop.unit]);
      summary.push({ name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'INSERTED' });
    } else {
      summary.push({ name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'skipped (exists)' });
    }
  }

  console.log('=== Seed Summary ===');
  console.table(summary);

  // Final state
  const final = await client.query('SELECT id, name, msp_rate, unit FROM crops ORDER BY id');
  console.log('\n=== Final crops table ===');
  console.table(final.rows);

  await client.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
