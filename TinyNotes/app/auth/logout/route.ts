import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sha256 } from "@/lib/crypto";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.split(";").map((x) => x.trim()).find((x) => x.startsWith("tn_session="));
  if (match) {
    const tokenRaw = decodeURIComponent(match.slice("tn_session=".length));
    db.query("DELETE FROM session WHERE token = ?").run(sha256(tokenRaw));
  }

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete("tn_session");
  return response;
}
