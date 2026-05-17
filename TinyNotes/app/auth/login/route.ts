import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthService } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { createSessionRecord, setSessionCookie } from "@/lib/session";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  const auth = createAuthService(db);
  const loggedIn = auth.login(parsed.data);
  if (!loggedIn.ok) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  const created = createSessionRecord(loggedIn.userId);
  const response = NextResponse.redirect(new URL("/notes", request.url), 303);
  setSessionCookie(response, created.tokenRaw, created.expiresAt);
  return response;
}
