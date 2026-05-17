import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "./db";
import { nowIso, randomToken, sha256 } from "./crypto";

const SESSION_COOKIE = "tn_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const row = db
    .query(
      `SELECT u.id, u.email, u.name
       FROM session s
       JOIN user u ON u.id = s.userId
       WHERE s.token = ? AND s.expiresAt > ?
       LIMIT 1`
    )
    .get(tokenHash, nowIso()) as SessionUser | null;

  return row ?? null;
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function createSession(userId: string): Promise<void> {
  const created = createSessionRecord(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, created.tokenRaw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(created.expiresAt),
  });
}

export function createSessionRecord(userId: string): { tokenRaw: string; expiresAt: string } {
  const tokenRaw = randomToken(32);
  const tokenHash = sha256(tokenRaw);
  const now = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  const id = crypto.randomUUID();

  db.query(
    `INSERT INTO session (id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)`
  ).run(id, userId, tokenHash, expiresAt, now, now);
  return { tokenRaw, expiresAt };
}

export function setSessionCookie(response: NextResponse, tokenRaw: string, expiresAt: string): void {
  response.cookies.set(SESSION_COOKIE, tokenRaw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    db.query("DELETE FROM session WHERE token = ?").run(sha256(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}
