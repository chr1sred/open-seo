import { createMiddleware } from "@tanstack/react-start";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Self-hosted mode: a single local admin user owns all data.
// Access control is handled at the HTTP layer (optional Basic Auth in
// src/server.ts) or by your reverse proxy.
const LOCAL_ADMIN_USER_ID = "local-admin";
const LOCAL_ADMIN_EMAIL = "admin@localhost";

async function ensureUserRecord(userId: string, userEmail: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email: userEmail,
    });
  }

  return existingUser?.email ?? userEmail;
}

export const ensureUserMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const userEmail = await ensureUserRecord(
    LOCAL_ADMIN_USER_ID,
    LOCAL_ADMIN_EMAIL,
  );

  return next({
    context: {
      userId: LOCAL_ADMIN_USER_ID,
      userEmail,
    },
  });
});
