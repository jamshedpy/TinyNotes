import { notFound } from "next/navigation";
import NoteEditorShell from "@/components/note-editor-shell";
import { getNoteByIdForUser } from "@/lib/notes";
import { requireSessionUser } from "@/lib/session";

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const { id } = await params;
  const note = getNoteByIdForUser(id, user.id);
  if (!note) notFound();
  const parsedContent = JSON.parse(note.content_json);
  const safeContent =
    parsedContent && parsedContent.type === "doc" && Array.isArray(parsedContent.content) && parsedContent.content.length > 0
      ? parsedContent
      : { type: "doc", content: [{ type: "paragraph" }] };

  return (
    <section className="stack">
      <NoteEditorShell
        noteId={note.id}
        initialTitle={note.title}
        initialContent={safeContent}
        initialShareEnabled={Boolean(note.share_enabled)}
      />
      <form action={`/auth/notes/${note.id}/delete`} method="post">
        <button type="submit" className="danger">Delete note</button>
      </form>
    </section>
  );
}
