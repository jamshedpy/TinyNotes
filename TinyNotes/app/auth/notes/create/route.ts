import { NextResponse } from "next/server";
import { createNote } from "@/lib/notes";
import { ensureContentJson } from "@/lib/content";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").slice(0, 200);
    const contentRaw = String(formData.get("contentJson") ?? '{"type":"doc","content":[{"type":"paragraph"}]}');
    const contentJson = ensureContentJson(JSON.parse(contentRaw));
    const id = createNote(user.id, title, contentJson);
    return NextResponse.redirect(new URL(`/notes/${id}`, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/notes/new?error=1", request.url), 303);
  }
}
