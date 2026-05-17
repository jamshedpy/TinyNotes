import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import BetterSqlite3 from "better-sqlite3";
import { env } from "./env";

mkdirSync(dirname(env.dbPath), { recursive: true });

const rawDb = new BetterSqlite3(env.dbPath);
rawDb.pragma("foreign_keys = ON");

export const db = {
  exec(sql: string) {
    rawDb.exec(sql);
  },
  query(sql: string) {
    const stmt = rawDb.prepare(sql);
    return {
      get: (...params: unknown[]) => stmt.get(...params),
      all: (...params: unknown[]) => stmt.all(...params),
      run: (...params: unknown[]) => stmt.run(...params),
    };
  },
  transaction<T extends (...args: never[]) => unknown>(fn: T): T {
    return rawDb.transaction(fn as never) as unknown as T;
  },
};
