import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { findUserBySession, upsertClerkUser } from "@/lib/db";
import { isClerkConfigured } from "@/lib/runtime-config";
import { createSessionToken, hashPassword } from "@/lib/security";

const SESSION_COOKIE = "growth_os_session";

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  if (isClerkConfigured()) {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@clerk.local`;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "Clerk User";
    return upsertClerkUser({
      clerkUserId: userId,
      email: primaryEmail,
      name
    });
  }

  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  return findUserBySession(token);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth");
  }
  return user;
}

export const sessionCookieName = SESSION_COOKIE;
export { createSessionToken, hashPassword };
