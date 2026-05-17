import { spawn } from "node:child_process";

const child = spawn("node", ["scripts/dev.mjs"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 1));
