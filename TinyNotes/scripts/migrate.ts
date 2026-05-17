import { spawnSync } from "node:child_process";

const result = spawnSync("node", ["scripts/migrate.mjs"], { stdio: "inherit", shell: true });
if (result.status !== 0) process.exit(result.status ?? 1);
