import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { deleteNote } from "@/lib/notes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);

  const { id } = await params;
  deleteNote(id, user.id);
  return NextResponse.redirect(new URL("/notes", request.url), 303);
}
