require('dotenv/config');

const { PrismaClient, user_role } = require('../dist/generated/prisma/client');
const { createUserWithProfile } = require('../dist/modules/users/registration');

const prisma = new PrismaClient();
const password = 'Test@12345';
const accounts = [
  {
    phone: '9999900001',
    email: 'mock.farmer@example.invalid',
    role: user_role.farmer,
    name: 'MOCK Farmer',
    id_proof: 'MOCK-ID-0001',
    village: 'MOCK Village',
  },
  {
    phone: '9999900002',
    email: 'mock.retail@example.invalid',
    role: user_role.retail_user,
  },
  {
    phone: '9999900003',
    email: 'mock.stockist@example.invalid',
    role: user_role.stockist,
    business_name: 'MOCK Stockist',
  },
  {
    phone: '9999900004',
    email: 'mock.broker@example.invalid',
    role: user_role.broker,
  },
  {
    phone: '9999900005',
    email: 'mock.buyer@example.invalid',
    role: user_role.buyer,
  },
  {
    phone: '9999900006',
    email: 'mock.centre-staff@example.invalid',
    role: user_role.operator,
  },
  {
    phone: '9999900007',
    email: 'mock.government-authority@example.invalid',
    role: user_role.admin,
  },
];

async function main() {
  const results = [];

  for (const account of accounts) {
    const existing = await prisma.users.findUnique({ where: { phone: account.phone } });
    if (existing) {
      results.push({ phone: account.phone, password, role: existing.role, status: 'skipped' });
      continue;
    }

    const user = await createUserWithProfile(prisma, { ...account, password });
    results.push({ phone: user.phone, password, role: user.role, status: 'created' });
  }

  console.table(results);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());