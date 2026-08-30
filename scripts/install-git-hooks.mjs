import { execFileSync } from "node:child_process";
import { chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const commitMessageHook = resolve(repositoryRoot, ".githooks", "commit-msg");

chmodSync(commitMessageHook, 0o755);
execFileSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

console.log("Configured core.hooksPath=.githooks for this checkout.");
