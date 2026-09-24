require('dotenv/config');

const { PrismaClient } = require('../dist/generated/prisma/client');

const prisma = new PrismaClient();
const mockPhones = [
  '9999900001',
  '9999900002',
  '9999900003',
  '9999900004',
  '9999900005',
  '9999900006',
  '9999900007',
];

async function main() {
  const users = await prisma.users.findMany({
    where: { phone: { in: mockPhones } },
    select: { id: true, phone: true },
  });

  for (const user of users) {
    await prisma.$transaction(async (tx) => {
      await tx.farmers.deleteMany({ where: { user_id: user.id } });
      await tx.retail_users.deleteMany({ where: { user_id: user.id } });
      await tx.stockists.deleteMany({ where: { user_id: user.id } });
      await tx.brokers.deleteMany({ where: { user_id: user.id } });
      await tx.buyers.deleteMany({ where: { user_id: user.id } });
      await tx.operators.deleteMany({ where: { user_id: user.id } });
      await tx.users.delete({ where: { id: user.id } });
    });
  }

  console.table(users.map((user) => ({ phone: user.phone, id: user.id, status: 'removed' })));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());