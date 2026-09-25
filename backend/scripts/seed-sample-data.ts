import 'dotenv/config';
import { PrismaService } from '../dist/common/prisma/prisma.service';
import { AuditLogService } from '../dist/modules/audit-log/audit-log.service';
import { SlotsService } from '../dist/modules/slots/slots.service';

const prisma = new PrismaService();
const slotsService = new SlotsService(prisma, new AuditLogService(prisma));

interface CentreInput {
  name: string;
  location: string;
  capacity_per_slot: number;
  processing_rate: number;
}

const centres: CentreInput[] = [
  { name: 'MOCK Meerut Grain Mandi', location: 'MOCK Meerut', capacity_per_slot: 30, processing_rate: 120 },
  { name: 'MOCK Modinagar Relief Mandi', location: 'MOCK Modinagar', capacity_per_slot: 25, processing_rate: 100 },
  { name: 'MOCK Hapur Central Mandi', location: 'MOCK Hapur', capacity_per_slot: 35, processing_rate: 140 },
];

function dateAt(daysFromToday: number, hours: number, minutes: number): Date {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + daysFromToday);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

function toDateOnly(value: Date): Date {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toTime(value: Date): Date {
  const d = new Date(value);
  return new Date(
    Date.UTC(1970, 0, 1, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds())
  );
}

async function main() {
  const summary: Array<{ type: string; name: string; status: string }> = [];

  let wheat = await prisma.crops.findFirst({ where: { name: 'Wheat' } });
  if (!wheat) {
    wheat = await prisma.crops.create({ data: { name: 'Wheat', msp_rate: 2275, unit: 'quintal' } });
    summary.push({ type: 'crop', name: 'Wheat', status: 'inserted' });
  } else {
    summary.push({ type: 'crop', name: 'Wheat', status: 'skipped' });
  }

  let rice = await prisma.crops.findFirst({ where: { name: 'Rice' } });
  if (!rice) {
    rice = await prisma.crops.create({ data: { name: 'Rice', msp_rate: 2300, unit: 'quintal' } });
    summary.push({ type: 'crop', name: 'Rice', status: 'inserted' });
  } else {
    summary.push({ type: 'crop', name: 'Rice', status: 'skipped' });
  }

  for (const input of centres) {
    let centre = await prisma.procurement_centres.findFirst({ where: { name: input.name } });
    if (!centre) {
      centre = await prisma.procurement_centres.create({ data: input });
      summary.push({ type: 'centre', name: centre.name, status: 'inserted' });
    } else {
      summary.push({ type: 'centre', name: centre.name, status: 'skipped' });
    }

    for (const day of [1, 2, 3]) {
      for (const [hours, minutes] of [[8, 0], [11, 0], [14, 0]]) {
        const date = dateAt(day, 0, 0);
        const startTime = dateAt(0, hours, minutes);
        const endTime = dateAt(0, hours + 1, minutes);

        const targetDate = toDateOnly(date);
        const targetStartTime = toTime(startTime);

        const existing = await prisma.slots.findFirst({
          where: {
            centre_id: centre.id,
            crop_id: wheat.id,
            date: targetDate,
            start_time: targetStartTime,
          },
        });

        const slotLabel = `${centre.name} ${targetDate.toISOString().slice(0, 10)} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        if (!existing) {
          await slotsService.create({
            centre_id: centre.id,
            crop_id: wheat.id,
            date,
            start_time: startTime,
            end_time: endTime,
            capacity: input.capacity_per_slot,
          });
          summary.push({ type: 'slot', name: slotLabel, status: 'inserted' });
        } else {
          summary.push({ type: 'slot', name: slotLabel, status: 'skipped' });
        }
      }
    }
  }

  console.table(summary);
}

main()
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
