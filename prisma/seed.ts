/**
 * Local development seed. Creates a sign-in-able account with sample content.
 *
 *   email:    demo@songbook.local
 *   password: songbook-demo
 *
 * Run with `npm run db:seed` (uses tsx with the react-server condition so the
 * app's `server-only` modules load outside Next.js).
 */
import "dotenv/config";
import { createCredentialUser } from "../src/lib/auth-users";
import { db } from "../src/lib/db";
import { seedDemoContent } from "../src/lib/demo/seed";

const EMAIL = "demo@songbook.local";
const PASSWORD = "songbook-demo";

async function main() {
  const existing = await db.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (existing) {
    await db.user.delete({ where: { id: existing.id } });
    console.log("Removed previous seed account.");
  }

  const userId = await createCredentialUser(db, { email: EMAIL, password: PASSWORD, name: "Sam Rivera" });
  await seedDemoContent(db, userId);
  console.log(`Seeded ${EMAIL} (password: ${PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
