import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsPath = resolve(repositoryRoot, "groove-docs");

function git(args, cwd = repositoryRoot, stdio = "pipe") {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio,
  })?.trim();
}

try {
  if (!existsSync(resolve(docsPath, ".git"))) {
    console.log("Initializing groove-docs submodule...");
    git(
      ["submodule", "update", "--init", "--recursive", "--", "groove-docs"],
      repositoryRoot,
      "inherit",
    );
  }

  if (git(["status", "--porcelain"], docsPath)) {
    throw new Error(
      "groove-docs has local changes. Commit or stash them before updating.",
    );
  }

  const previousCommit = git(["rev-parse", "HEAD"], docsPath);
  git(["fetch", "origin", "main"], docsPath, "inherit");
  git(["merge", "--ff-only", "FETCH_HEAD"], docsPath, "inherit");
  const currentCommit = git(["rev-parse", "HEAD"], docsPath);

  if (previousCommit === currentCommit) {
    console.log(`groove-docs is already up to date (${currentCommit.slice(0, 7)}).`);
  } else {
    console.log(
      `Updated groove-docs: ${previousCommit.slice(0, 7)} -> ${currentCommit.slice(0, 7)}.`,
    );
    console.log(
      "Commit the groove-docs pointer in groove-client to share this version with the team.",
    );
  }
} catch (error) {
  console.error(`Failed to update groove-docs: ${error.message}`);
  process.exitCode = 1;
}
