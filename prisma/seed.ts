import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Database seed — the IT build ships with ZERO content.
//
// The only thing seeded is the first administrator(s), so someone can sign in
// with SSO and start creating events, teams and users:
//   SEED_ADMIN_EMAIL="first.admin@moca.gov.ae,second.admin@moca.gov.ae"
// Re-running is safe: existing users keep their data and are promoted to ADMIN.
async function main() {
  const raw = process.env.SEED_ADMIN_EMAIL || '';
  const emails = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!emails.length) {
    console.log('[seed] SEED_ADMIN_EMAIL not set — nothing to seed (no content is ever seeded).');
    return;
  }
  for (const email of emails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', active: true },
      create: { email, name: 'Administrator', role: 'ADMIN', active: true },
    });
    console.log(`[seed] Administrator ready: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
