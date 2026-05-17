import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { disableShare } from "@/lib/notes";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });

  const { id } = await params;
  const result = disableShare(id, user.id);
  if (!result) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Note not found." } }, { status: 404 });
  return NextResponse.json({ ok: true, data: { shareEnabled: false } });
}
