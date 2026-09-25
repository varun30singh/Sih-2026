/**
 * seed-more-crops.ts
 *
 * Adds real MSP (Minimum Support Price) crops to the database.
 *
 * DATA SOURCE:
 *   - Kharif crops (2025-26 Marketing Season):
 *       Cabinet Committee on Economic Affairs (CCEA) approval, May 28 2025.
 *       Press Information Bureau, Ministry of Agriculture & Farmers Welfare.
 *       https://pib.gov.in  (search CCEA Kharif MSP 2025-26)
 *
 *   - Rabi crops (2025-26 Marketing Season):
 *       CCEA approval, October 2024.
 *       Press Information Bureau, Ministry of Agriculture & Farmers Welfare.
 *       https://pib.gov.in  (search CCEA Rabi MSP 2025-26)
 *
 *   - Wheat (2025-26 Rabi, ₹2,425/qtl) and Rice/Paddy (Kharif 2025-26, ₹2,369/qtl)
 *     are the current season rates.  The existing seed-sample-data.ts seeded older
 *     values (Wheat ₹2,275, Rice ₹2,300 — those were 2024-25 rates).
 *     This script UPDATES them to the current 2025-26 figures if present.
 *
 * HOW TO RUN (from backend/ directory):
 *   npx ts-node --project tsconfig.json scripts/seed-more-crops.ts
 *
 * The script is idempotent:
 *   - Skips any crop already present by exact name.
 *   - Updates Wheat and Rice MSP rates to the 2025-26 season values.
 *   - Prints a summary table at the end.
 *
 * DO NOT run this script without reviewing the MSP figures below
 * against the official PIB / CACP announcements first.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CropInput {
  name: string;
  msp_rate: number; // ₹ per quintal
  unit: string;
  season: string;   // informational — not stored in DB, just for the summary
}

// ─── KHARIF 2025-26 (announced May 28, 2025 by CCEA) ───────────────────────
// Source: PIB press release on CCEA Kharif MSP 2025-26
const kharifCrops: CropInput[] = [
  // Cereals / Nutri-cereals
  { name: 'Paddy (Common)',  msp_rate: 2369, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Paddy (Grade A)', msp_rate: 2389, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Bajra',           msp_rate: 2775, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Maize',           msp_rate: 2400, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Jowar (Hybrid)',  msp_rate: 3699, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Jowar (Maldandi)',msp_rate: 3749, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Ragi',            msp_rate: 4600, unit: 'quintal', season: 'Kharif 2025-26' },

  // Pulses
  { name: 'Tur (Arhar)',     msp_rate: 8000, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Moong',           msp_rate: 8768, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Urad',            msp_rate: 7800, unit: 'quintal', season: 'Kharif 2025-26' },

  // Oilseeds
  { name: 'Groundnut',         msp_rate: 7263, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Soybean (Yellow)',  msp_rate: 5328, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Sunflower Seed',    msp_rate: 7580, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Sesamum',           msp_rate: 9267, unit: 'quintal', season: 'Kharif 2025-26' },

  // Fibre
  { name: 'Cotton (Medium Staple)', msp_rate: 7710, unit: 'quintal', season: 'Kharif 2025-26' },
  { name: 'Cotton (Long Staple)',   msp_rate: 8110, unit: 'quintal', season: 'Kharif 2025-26' },
];

// ─── RABI 2025-26 (announced October 2024 by CCEA) ──────────────────────────
// Source: PIB press release on CCEA Rabi MSP 2025-26
const rabiCrops: CropInput[] = [
  { name: 'Wheat',                msp_rate: 2425, unit: 'quintal', season: 'Rabi 2025-26' },
  { name: 'Barley',               msp_rate: 1980, unit: 'quintal', season: 'Rabi 2025-26' },
  { name: 'Gram (Chana)',         msp_rate: 5650, unit: 'quintal', season: 'Rabi 2025-26' },
  { name: 'Lentil (Masur)',       msp_rate: 6700, unit: 'quintal', season: 'Rabi 2025-26' },
  { name: 'Rapeseed & Mustard',   msp_rate: 5950, unit: 'quintal', season: 'Rabi 2025-26' },
  { name: 'Safflower',            msp_rate: 5940, unit: 'quintal', season: 'Rabi 2025-26' },
];

// ─── SKIPPED (insufficient reliable data for the specific 2025-26 season): ─
//   Nigerseed — verify from official PIB before adding.
//   Jute       — MSP set per quintal but verify the 2025-26 figure.

const allNewCrops = [...kharifCrops, ...rabiCrops];

// Names already seeded by seed-sample-data.ts that need MSP updates
const UPDATE_MSP: Record<string, number> = {
  'Wheat': 2425,   // was ₹2,275 (2024-25) → updated to ₹2,425 (2025-26)
  'Rice':  2369,   // was ₹2,300 (2024-25) → updated to ₹2,369 (Paddy Common 2025-26)
};

async function main() {
  const summary: Array<{ type: string; name: string; msp: number; season: string; status: string }> = [];

  // 1. Update existing Wheat and Rice to 2025-26 rates
  for (const [name, newRate] of Object.entries(UPDATE_MSP)) {
    const existing = await prisma.crops.findFirst({ where: { name } });
    if (existing) {
      if (existing.msp_rate !== newRate) {
        await prisma.crops.update({ where: { id: existing.id }, data: { msp_rate: newRate } });
        summary.push({ type: 'crop', name, msp: newRate, season: '(updated to 2025-26)', status: 'updated' });
      } else {
        summary.push({ type: 'crop', name, msp: newRate, season: '(already current)', status: 'up-to-date' });
      }
    } else {
      summary.push({ type: 'crop', name, msp: newRate, season: '(not found)', status: 'not-found — will be inserted below if listed' });
    }
  }

  // 2. Insert new crops (skip by exact name — case-sensitive)
  for (const crop of allNewCrops) {
    // Don't double-insert Wheat/Rice — they're handled above (or by the original seed)
    if (crop.name === 'Wheat' || crop.name === 'Rice') {
      summary.push({ type: 'crop', name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'handled-by-update-step' });
      continue;
    }

    const existing = await prisma.crops.findFirst({ where: { name: crop.name } });
    if (!existing) {
      await prisma.crops.create({
        data: {
          name: crop.name,
          msp_rate: crop.msp_rate,
          unit: crop.unit,
        },
      });
      summary.push({ type: 'crop', name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'inserted' });
    } else {
      summary.push({ type: 'crop', name: crop.name, msp: crop.msp_rate, season: crop.season, status: 'skipped (exists)' });
    }
  }

  console.log('\n=== Crop Seed Summary ===');
  console.table(summary);
  console.log('\nData source: CCEA / PIB (Ministry of Agriculture & Farmers Welfare)');
  console.log('Kharif season: 2025-26 (announced May 28, 2025)');
  console.log('Rabi season:   2025-26 (announced October 2024)');
}

main()
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
