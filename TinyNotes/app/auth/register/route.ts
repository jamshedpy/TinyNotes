import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthService } from "@/lib/auth-service";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/register?error=1", request.url), 303);
  }

  const auth = createAuthService(db);
  const created = auth.register(parsed.data);
  if (!created.ok) {
    return NextResponse.redirect(new URL("/register?error=1", request.url), 303);
  }

  return NextResponse.redirect(new URL("/login?registered=1", request.url), 303);
}
