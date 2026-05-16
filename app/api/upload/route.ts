import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { resolveApiUser } from "@/lib/api-user";

export async function POST(request: Request) {
  const user = await resolveApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const extension = path.extname(file.name) || ".bin";
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return NextResponse.json({
    url: `/uploads/${fileName}`,
    name: file.name
  });
}
