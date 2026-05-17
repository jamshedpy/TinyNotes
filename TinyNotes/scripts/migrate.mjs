import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import BetterSqlite3 from "better-sqlite3";

const dbPath = process.env.DB_PATH ?? "./data/tinynotes.db";
mkdirSync(dirname(dbPath), { recursive: true });
const db = new BetterSqlite3(dbPath);
db.pragma("foreign_keys = ON");

// Keep this idempotent even before migrations folder exists.
db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL);");

const files = readdirSync("./migrations").filter((f) => f.endsWith(".sql")).sort();
for (const file of files) {
  const applied = db.prepare("SELECT version FROM schema_migrations WHERE version = ? LIMIT 1").get(file);
  if (applied) continue;

  const sql = readFileSync(join("./migrations", file), "utf8");
  db.transaction(() => {
    db.exec(sql);
    db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(file, new Date().toISOString());
  })();

  console.log(`Applied migration ${file}`);
}

console.log("Migrations complete.");
