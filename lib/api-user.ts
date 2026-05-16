import { getCurrentUser } from "@/lib/auth";
import { publicUser } from "@/lib/db";
import { UserRecord } from "@/lib/models";

export async function resolveApiUser(): Promise<UserRecord | null> {
  return getCurrentUser();
}

export async function resolvePublicApiUser() {
  const user = await resolveApiUser();
  return user ? publicUser(user) : null;
}
