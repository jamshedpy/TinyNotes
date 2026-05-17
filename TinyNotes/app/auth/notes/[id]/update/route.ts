import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { updateNote } from "@/lib/notes";
import { ensureContentJson } from "@/lib/content";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json() as { title?: string; contentJson?: unknown };
    let content: string | null = null;
    if (body.contentJson !== undefined) content = ensureContentJson(body.contentJson);
    const updated = updateNote(id, user.id, body.title ?? null, content);
    if (!updated) return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Note not found." } }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Unable to save note." } }, { status: 500 });
  }
}
