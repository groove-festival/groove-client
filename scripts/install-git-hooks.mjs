import { execFileSync } from "node:child_process";
import { chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hookNames = ["commit-msg", "post-commit", "pre-push"];

for (const hookName of hookNames) {
  chmodSync(resolve(repositoryRoot, ".githooks", hookName), 0o755);
}
execFileSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

console.log("Configured core.hooksPath=.githooks for this checkout.");
