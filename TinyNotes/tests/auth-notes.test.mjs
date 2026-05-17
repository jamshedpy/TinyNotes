import test from "node:test";
import assert from "node:assert/strict";
import BetterSqlite3 from "better-sqlite3";
import { readFileSync } from "node:fs";
import { createAuthService } from "../lib/auth-service";
import { createNoteService } from "../lib/notes";

function setupDb() {
  const raw = new BetterSqlite3(":memory:");
  raw.pragma("foreign_keys = ON");
  raw.exec(readFileSync("./migrations/0001_auth.sql", "utf8"));
  raw.exec(readFileSync("./migrations/0002_notes.sql", "utf8"));
  return {
    query(sql) {
      const stmt = raw.prepare(sql);
      return { get: (...p) => stmt.get(...p), all: (...p) => stmt.all(...p), run: (...p) => stmt.run(...p) };
    },
    transaction(fn) {
      return raw.transaction(fn);
    },
  };
}

test("register and login", () => {
  const db = setupDb();
  const auth = createAuthService(db);
  const created = auth.register({ name: "A", email: "a@example.com", password: "password123" });
  assert.equal(created.ok, true);
  const logged = auth.login({ email: "a@example.com", password: "password123" });
  assert.equal(logged.ok, true);
});

test("share enable-disable", () => {
  const db = setupDb();
  const auth = createAuthService(db);
  const notes = createNoteService(db);
  const user = auth.register({ name: "U", email: "u@example.com", password: "password123" });
  assert.equal(user.ok, true);
  const noteId = notes.createNote(user.userId, "Title", JSON.stringify({ type: "doc", content: [] }));
  const enabled = notes.enableShare(noteId, user.userId);
  assert.ok(enabled);
  assert.equal(notes.getSharedNoteByToken(enabled.token)?.title, "Title");
  notes.disableShare(noteId, user.userId);
  assert.equal(notes.getSharedNoteByToken(enabled.token), null);
});
