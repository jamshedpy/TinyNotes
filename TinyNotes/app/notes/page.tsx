import Link from "next/link";
import { listNotesByUser } from "@/lib/notes";
import { requireSessionUser } from "@/lib/session";

export default async function NotesPage() {
  const user = await requireSessionUser();
  const notes = listNotesByUser(user.id);

  return (
    <section className="stack">
      <div className="row between">
        <h2>Your Notes</h2>
        <Link href="/notes/new">New note</Link>
      </div>
      {notes.length === 0 ? <p className="card">No notes yet.</p> : null}
      <ul className="stack">
        {notes.map((note) => (
          <li key={note.id} className="card row between">
            <div>
              <Link href={`/notes/${note.id}`}>{note.title || "Untitled"}</Link>
              <p className="muted">Updated: {new Date(note.updated_at).toLocaleString()}</p>
            </div>
            <span>{note.share_enabled ? "Shared" : "Private"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
