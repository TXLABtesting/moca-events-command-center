import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Database seed.
//
// The IT build ships with ZERO fake data: this seed only provisions an initial
// administrator (so someone can sign in and start creating events) when
// SEED_ADMIN_EMAIL is set. It creates no events, teams, or sample content.
//
// The demo build does not need this — its fake data lives client-side in the
// dashboard's seed arrays.
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  if (!email) {
    console.log('[seed] No SEED_ADMIN_EMAIL set — nothing to seed (IT build starts empty).');
    return;
  }
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: { email, name: 'Administrator', role: 'ADMIN' },
  });
  console.log(`[seed] Ensured admin user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
