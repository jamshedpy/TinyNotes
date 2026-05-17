import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.INIT_CWD;
delete env.PWD;
delete env.npm_config_local_prefix;
delete env.NEXT_DIST_DIR;
delete env.NEXT_PRIVATE_DIST_DIR;

const child = spawn("next", ["dev"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 1));
