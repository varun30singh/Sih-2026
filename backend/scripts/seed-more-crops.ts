/**
 * seed-more-crops.ts
 *
 * Adds/updates real MSP (Minimum Support Price) crops in the database.
 *
 * DATA SOURCE (2026-27 season — the CURRENT season as of Sep 2026):
 *   - Rabi 2026-27:  CCEA approval 1 Oct 2025, PIB press release.
 *       Ministry of Agriculture & Farmers Welfare, Government of India.
 *       https://pib.gov.in  (PRID for Rabi MSP 2026-27, Oct 2025)
 *
 *   - Kharif 2026-27: CCEA approval 13 May 2026, PIB press release.
 *       Ministry of Agriculture & Farmers Welfare, Government of India.
 *       https://pib.gov.in  (PRID for Kharif MSP 2026-27, May 2026)
 *
 * EXISTING DB STATE (as of Sep 2026 before this script):
 *   id=1 Wheat  ₹2,275  ← 2024-25 rate, STALE → update to ₹2,585
 *   id=2 Rice   ₹2,300  ← 2024-25 rate, STALE → update to ₹2,441
 *
 * HOW TO RUN (from the backend/ project root):
 *   npx ts-node --project tsconfig.json scripts/seed-more-crops.ts
 *
 * IDEMPOTENCY:
 *   - Wheat and Rice: always UPDATE to the current season rate.
 *   - All other crops: insert if not exists by exact name, skip if already present.
 *   - Safe to re-run at any time.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CropInput {
  name: string;
  msp_rate: number; // ₹ per quintal
  unit: string;
  season: string;   // informational — not stored in DB, for the summary log only
}

// ─── RABI 2026-27 (CCEA approval: 1 October 2025) ───────────────────────────
// Source: PIB press release, Ministry of Agriculture & Farmers Welfare
const rabiCrops: CropInput[] = [
  // NOTE: Wheat is handled separately in the UPDATE step below.
  { name: 'Barley',             msp_rate: 2150, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Gram (Chana)',       msp_rate: 5875, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Lentil (Masur)',     msp_rate: 7000, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Rapeseed & Mustard', msp_rate: 6200, unit: 'quintal', season: 'Rabi 2026-27' },
  { name: 'Safflower',          msp_rate: 6540, unit: 'quintal', season: 'Rabi 2026-27' },
];

// ─── KHARIF 2026-27 (CCEA approval: 13 May 2026) ────────────────────────────
// Source: PIB press release, Ministry of Agriculture & Farmers Welfare
const kharifCrops: CropInput[] = [
  // NOTE: Rice/Paddy Common is handled separately in the UPDATE step below.
  { name: 'Paddy (Grade A)',         msp_rate: 2461, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Bajra',                   msp_rate: 2900, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Maize',                   msp_rate: 2410, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Jowar (Hybrid)',          msp_rate: 4023, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Jowar (Maldandi)',        msp_rate: 4073, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Ragi',                    msp_rate: 5205, unit: 'quintal', season: 'Kharif 2026-27' },
  // Pulses
  { name: 'Tur (Arhar)',             msp_rate: 8450, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Moong',                   msp_rate: 8780, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Urad',                    msp_rate: 8200, unit: 'quintal', season: 'Kharif 2026-27' },
  // Oilseeds
  { name: 'Groundnut',               msp_rate: 7517, unit: 'quintal', season: 'Kharif 2026-27' },
  { name: 'Soybean (Yellow)',        msp_rate: 5708, unit: 'quintal', season: 'Kharif 2026-27' },
  // ── 2026-27 figures for the crops below are NOT yet fully verified from PIB ──
  // Keeping their 2025-26 CCEA-approved values until confirmed:
  { name: 'Sunflower Seed',          msp_rate: 7580, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
  { name: 'Sesamum',                 msp_rate: 9267, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
  { name: 'Cotton (Medium Staple)',  msp_rate: 7710, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
  { name: 'Cotton (Long Staple)',    msp_rate: 8110, unit: 'quintal', season: 'Kharif 2025-26 (2026-27 pending)' },
];

// All "insert-if-not-exists" crops
const allNewCrops: CropInput[] = [...rabiCrops, ...kharifCrops];

// ─── ALWAYS-UPDATE: Existing seeded records with stale 2024-25 rates ──────────
// Both "Wheat" and "Rice" rows already exist (id=1, id=2) with old rates.
// We always overwrite their msp_rate to the current season's figure.
const ALWAYS_UPDATE: Record<string, { msp_rate: number; season: string }> = {
  'Wheat': { msp_rate: 2585, season: 'Rabi 2026-27'   },  // was ₹2,275 (2024-25)
  'Rice':  { msp_rate: 2441, season: 'Kharif 2026-27' },  // was ₹2,300 (2024-25)
};

async function main() {
  type Row = { type: string; name: string; msp: number; season: string; status: string };
  const summary: Row[] = [];

  // ── Step 1: Force-update Wheat and Rice to current season rates ─────────────
  for (const [cropName, { msp_rate, season }] of Object.entries(ALWAYS_UPDATE)) {
    const existing = await prisma.crops.findFirst({ where: { name: cropName } });
    if (existing) {
      await prisma.crops.update({ where: { id: existing.id }, data: { msp_rate } });
      const prev = existing.msp_rate;
      summary.push({
        type: 'crop', name: cropName, msp: msp_rate, season,
        status: prev !== msp_rate ? `updated (was ₹${prev})` : 'already current',
      });
    } else {
      // Not in DB at all — insert it
      await prisma.crops.create({ data: { name: cropName, msp_rate, unit: 'quintal' } });
      summary.push({ type: 'crop', name: cropName, msp: msp_rate, season, status: 'inserted (was missing)' });
    }
  }

  // ── Step 2: Insert new crops (skip by exact name if already present) ─────────
  for (const crop of allNewCrops) {
    const existing = await prisma.crops.findFirst({ where: { name: crop.name } });
    if (!existing) {
      await prisma.crops.create({
        data: { name: crop.name, msp_rate: crop.msp_rate, unit: crop.unit },
      });
      summary.push({ type: 'crop', name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'inserted' });
    } else {
      summary.push({ type: 'crop', name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'skipped (exists)' });
    }
  }

  console.log('\n=== Crop Seed Summary ===');
  console.table(summary);
  console.log('\nData source : CCEA / PIB, Ministry of Agriculture & Farmers Welfare, Govt. of India');
  console.log('Rabi  2026-27: approved 1 Oct 2025');
  console.log('Kharif 2026-27: approved 13 May 2026');
  console.log('Sunflower Seed / Sesamum / Cotton: retaining 2025-26 values — verify 2026-27 from PIB before updating.');
}

main()
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
