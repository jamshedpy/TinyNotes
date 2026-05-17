import { notFound } from "next/navigation";
import { getSharedNoteByToken } from "@/lib/notes";
import { renderSanitizedHtml } from "@/lib/content";

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const note = getSharedNoteByToken(token);
  if (!note) notFound();

  const html = renderSanitizedHtml(note.content_json);

  return (
    <article className="card stack">
      <h1>{note.title || "Untitled note"}</h1>
      <p className="muted">Updated: {new Date(note.updated_at).toLocaleString()}</p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
