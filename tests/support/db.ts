import { db } from "@/lib/db";

/** Creates a throwaway user for a test and returns its id. */
export async function createTestUser(label: string): Promise<string> {
  const id = `test_${label}_${crypto.randomUUID().slice(0, 8)}`;
  await db.user.create({
    data: { id, email: `${id}@test.local`, name: label, emailVerified: true },
  });
  return id;
}

/** Removes test users; cascades clean up everything they own. */
export async function deleteTestUsers(ids: string[]): Promise<void> {
  await db.user.deleteMany({ where: { id: { in: ids } } });
}

export { db };
