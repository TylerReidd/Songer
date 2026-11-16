import "server-only";
import { hashPassword } from "better-auth/crypto";
import type { PrismaClient } from "@/generated/prisma/client";

interface NewCredentialUser {
  email: string;
  password: string;
  name: string;
  isDemo?: boolean;
}

/**
 * Creates an email/password account directly in the database, already
 * verified, bypassing the public sign-up flow and its verification email.
 * Used by the local seed and by "Try the demo"; real users always go through
 * Better Auth's sign-up.
 */
export async function createCredentialUser(db: PrismaClient, user: NewCredentialUser): Promise<string> {
  const id = crypto.randomUUID();
  await db.user.create({
    data: {
      id,
      email: user.email,
      name: user.name,
      emailVerified: true,
      isDemo: user.isDemo ?? false,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          providerId: "credential",
          // Better Auth looks up credential accounts by accountId === user.id.
          accountId: id,
          password: await hashPassword(user.password),
        },
      },
    },
  });
  return id;
}
