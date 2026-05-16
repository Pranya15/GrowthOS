import { NextResponse } from "next/server";
import { resolvePublicApiUser } from "@/lib/api-user";

export async function GET() {
  const user = await resolvePublicApiUser();

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json(user);
}
