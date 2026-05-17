import { nowIso, hashPassword, verifyPassword } from "./crypto";

type DbLike = {
  query: (sql: string) => { get: (...params: unknown[]) => unknown; run: (...params: unknown[]) => { changes?: number } };
  transaction: <T extends (...args: never[]) => unknown>(fn: T) => T;
};

export function createAuthService(db: DbLike) {
  return {
    register(input: { name: string; email: string; password: string }): { ok: true; userId: string } | { ok: false; code: "CONFLICT" } {
      const existing = db.query("SELECT id FROM user WHERE email = ? LIMIT 1").get(input.email) as { id: string } | null;
      if (existing) return { ok: false, code: "CONFLICT" };

      const now = nowIso();
      const userId = crypto.randomUUID();
      db.transaction(() => {
        db.query("INSERT INTO user (id, name, email, emailVerified, image, createdAt, updatedAt) VALUES (?, ?, ?, 0, NULL, ?, ?)")
          .run(userId, input.name, input.email, now, now);
        db.query(
          `INSERT INTO account (id, userId, accountId, providerId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, idToken, password, createdAt, updatedAt)
           VALUES (?, ?, ?, 'credential', NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, ?)`
        ).run(crypto.randomUUID(), userId, input.email, hashPassword(input.password), now, now);
      })();

      return { ok: true, userId };
    },

    login(input: { email: string; password: string }): { ok: true; userId: string } | { ok: false; code: "UNAUTHORIZED" } {
      const row = db
        .query(
          `SELECT u.id, a.password
           FROM user u
           JOIN account a ON a.userId = u.id
           WHERE u.email = ? AND a.providerId = 'credential'
           LIMIT 1`
        )
        .get(input.email) as { id: string; password: string } | null;

      if (!row || !verifyPassword(input.password, row.password)) {
        return { ok: false, code: "UNAUTHORIZED" };
      }

      return { ok: true, userId: row.id };
    },
  };
}
