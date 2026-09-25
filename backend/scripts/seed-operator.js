require('dotenv/config');

const { PrismaService } = require('../dist/common/prisma/prisma.service');
const { createUserWithProfile } = require('../dist/modules/users/registration');
const { user_role } = require('../dist/generated/prisma/client');

const phone = process.env.OPERATOR_PHONE;
const password = process.env.OPERATOR_PASSWORD;
const prisma = new PrismaService();

async function main() {
  if (!phone || !password) {
    throw new Error('OPERATOR_PHONE and OPERATOR_PASSWORD are required environment variables.');
  }

  if (password.length < 12) {
    throw new Error('OPERATOR_PASSWORD must be at least 12 characters.');
  }

  const existing = await prisma.users.findUnique({ where: { phone } });
  if (existing) {
    console.log(`phone: ${existing.phone}\nrole: ${existing.role}\nid: ${existing.id}\nstatus: skipped`);
    return;
  }

  const user = await createUserWithProfile(prisma, {
    phone,
    password,
    role: user_role.operator,
  });

  console.log(`phone: ${user.phone}\nrole: ${user.role}\nid: ${user.id}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());