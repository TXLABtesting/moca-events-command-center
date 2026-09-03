// Switches the Prisma datasource provider between postgresql and mysql.
//   npm run db:use-mysql      → provider = "mysql"
//   npm run db:use-postgres   → provider = "postgresql"
// After switching, delete prisma/migrations (they are provider-specific) and run
// `npx prisma migrate dev --name init` once against the target database, or use
// `npx prisma db push` for a quick staging setup. See IT-DEPLOYMENT-GUIDE.md.
const fs = require('fs');
const path = require('path');
const target = process.argv[2] === 'mysql' ? 'mysql' : 'postgresql';
const file = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let s = fs.readFileSync(file, 'utf8');
s = s.replace(/provider\s*=\s*"(postgresql|mysql)"/, `provider = "${target}"`);
fs.writeFileSync(file, s);
console.log(`prisma/schema.prisma → provider = "${target}"`);
if (target === 'mysql') console.log('Reminder: remove prisma/migrations/* (Postgres-specific) and run `npx prisma migrate dev --name init` against MySQL.');
