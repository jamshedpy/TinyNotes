import { db } from "./db";
import { nowIso, randomToken, sha256 } from "./crypto";
type DbLike = {
  query: (sql: string) => { get: (...params: unknown[]) => unknown; all: (...params: unknown[]) => unknown[]; run: (...params: unknown[]) => { changes?: number } };
  transaction: <T extends (...args: never[]) => unknown>(fn: T) => T;
};

export type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  share_enabled: number;
  created_at: string;
  updated_at: string;
};

export function createNoteService(database: DbLike) {
  return {
    listNotesByUser(userId: string) {
      return database
    .query(`SELECT id, title, share_enabled, created_at, updated_at FROM note WHERE user_id = ? ORDER BY updated_at DESC`)
    .all(userId) as Array<Pick<NoteRow, "id" | "title" | "share_enabled" | "created_at" | "updated_at">>;
    },

    getNoteByIdForUser(id: string, userId: string): NoteRow | null {
      return (database
    .query(`SELECT id, user_id, title, content_json, share_enabled, created_at, updated_at FROM note WHERE id = ? AND user_id = ? LIMIT 1`)
    .get(id, userId) as NoteRow | null) ?? null;
    },

    createNote(userId: string, title: string, contentJson: string): string {
  const id = crypto.randomUUID();
  const now = nowIso();
  database.query(
    `INSERT INTO note (id, user_id, title, content_json, share_enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`
  ).run(id, userId, title, contentJson, now, now);
  return id;
    },

    updateNote(id: string, userId: string, title: string | null, contentJson: string | null): boolean {
  const now = nowIso();
  const result = database
    .query(
      `UPDATE note
       SET title = COALESCE(?, title), content_json = COALESCE(?, content_json), updated_at = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(title, contentJson, now, id, userId);
  return Number(result.changes) > 0;
    },

    deleteNote(id: string, userId: string): boolean {
      const result = database.query(`DELETE FROM note WHERE id = ? AND user_id = ?`).run(id, userId);
  return Number(result.changes) > 0;
    },

    enableShare(noteId: string, userId: string): { token: string } | null {
      const owned = database.query(`SELECT id FROM note WHERE id = ? AND user_id = ?`).get(noteId, userId) as { id: string } | null;
  if (!owned) return null;

  const token = randomToken(32);
  const tokenHash = sha256(token);
  const now = nowIso();
  const shareId = crypto.randomUUID();

  database.transaction(() => {
    database.query(`UPDATE note_share SET enabled = 0, disabled_at = ? WHERE note_id = ?`).run(now, noteId);
    database.query(
      `INSERT INTO note_share (id, note_id, token_hash, enabled, created_at, disabled_at)
       VALUES (?, ?, ?, 1, ?, NULL)`
    ).run(shareId, noteId, tokenHash, now);
    database.query(`UPDATE note SET share_enabled = 1, updated_at = ? WHERE id = ? AND user_id = ?`).run(now, noteId, userId);
  })();

  return { token };
    },

    disableShare(noteId: string, userId: string): boolean {
      const owned = database.query(`SELECT id FROM note WHERE id = ? AND user_id = ?`).get(noteId, userId) as { id: string } | null;
  if (!owned) return false;
  const now = nowIso();

  database.transaction(() => {
    database.query(`UPDATE note_share SET enabled = 0, disabled_at = ? WHERE note_id = ?`).run(now, noteId);
    database.query(`UPDATE note SET share_enabled = 0, updated_at = ? WHERE id = ? AND user_id = ?`).run(now, noteId, userId);
  })();

  return true;
    },

    getSharedNoteByToken(token: string): { title: string; content_json: string; updated_at: string } | null {
  const hash = sha256(token);
  return (
    (database
      .query(
        `SELECT n.title, n.content_json, n.updated_at
         FROM note_share s
         JOIN note n ON n.id = s.note_id
         WHERE s.token_hash = ? AND s.enabled = 1 AND n.share_enabled = 1
         LIMIT 1`
      )
      .get(hash) as { title: string; content_json: string; updated_at: string } | null) ?? null
  );
    },
  };
}

const noteService = createNoteService(db);
export const listNotesByUser = noteService.listNotesByUser;
export const getNoteByIdForUser = noteService.getNoteByIdForUser;
export const createNote = noteService.createNote;
export const updateNote = noteService.updateNote;
export const deleteNote = noteService.deleteNote;
export const enableShare = noteService.enableShare;
export const disableShare = noteService.disableShare;
export const getSharedNoteByToken = noteService.getSharedNoteByToken;
