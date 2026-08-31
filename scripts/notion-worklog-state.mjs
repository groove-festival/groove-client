import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2];

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  }).trim();
}

function getConfig(key) {
  try {
    return git(["config", "--get", key]);
  } catch {
    return "";
  }
}

function setConfig(key, value) {
  git(["config", "--local", key, value]);
}

function currentCommit() {
  return git(["rev-parse", "HEAD"]);
}

function resolveCommit(value) {
  return git(["rev-parse", `${value}^{commit}`]);
}

function hasUnpushedCommits() {
  try {
    return Number(git(["rev-list", "--count", "@{upstream}..HEAD"])) > 0;
  } catch {
    return true;
  }
}

function statePath() {
  const gitPath = git(["rev-parse", "--git-path", "ai-worklog/notion-sync.json"]);
  return resolve(repositoryRoot, gitPath);
}

function readState() {
  const path = statePath();
  if (!existsSync(path)) {
    return { version: 2, records: {} };
  }

  const state = JSON.parse(readFileSync(path, "utf8"));
  state.version = 2;
  state.records ??= {};

  if (state.syncedCommit && !state.records[state.syncedCommit]) {
    state.records[state.syncedCommit] = {
      recordUrl: state.recordUrl,
      syncedAt: state.syncedAt,
    };
  }

  delete state.syncedCommit;
  delete state.syncedAt;
  delete state.recordUrl;
  return state;
}

function writeState(state) {
  const path = statePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function validateNotionUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  const host = url.hostname.toLowerCase();
  const isNotionHost =
    host === "notion.so" ||
    host.endsWith(".notion.so") ||
    host === "notion.com" ||
    host.endsWith(".notion.com") ||
    host === "notion.site" ||
    host.endsWith(".notion.site");

  if (url.protocol !== "https:" || !isNotionHost) {
    throw new Error(`${label} must be an HTTPS Notion URL.`);
  }

  return url.toString();
}

function setup() {
  const targetUrl = validateNotionUrl(process.argv[3], "Personal target");
  const commit = currentCommit();
  const state = readState();

  setConfig("aiworklog.enabled", "true");
  setConfig("aiworklog.notionPageUrl", targetUrl);

  state.pendingCommit = commit;
  if (!hasUnpushedCommits() && !state.records[commit]) {
    state.records[commit] = {
      baseline: true,
      syncedAt: new Date().toISOString(),
    };
  }
  state.configuredAt = new Date().toISOString();
  writeState(state);

  console.log("Configured this checkout for Notion worklog publishing.");
  console.log(`Target: ${targetUrl}`);
  console.log("OAuth remains local to each Codex or Claude Code client.");
}

function markPending() {
  const state = readState();
  state.pendingCommit = currentCommit();
  state.pendingAt = new Date().toISOString();
  writeState(state);
  console.log(`Notion worklog pending for ${state.pendingCommit}.`);
}

function markSynced() {
  const recordUrl = validateNotionUrl(process.argv[3], "Work record");
  const commit = currentCommit();
  const state = readState();

  if (state.pendingCommit !== commit) {
    throw new Error(
      "Current HEAD is not the pending commit. Run the pending command or create a new commit before marking synchronization.",
    );
  }

  state.records[commit] = {
    recordUrl,
    syncedAt: new Date().toISOString(),
  };
  writeState(state);
  console.log(`Notion worklog synchronized for ${commit}.`);
  console.log(`Record: ${recordUrl}`);
}

function isBypassed() {
  return getConfig("aiworklog.skip").toLowerCase() === "true";
}

function check() {
  if (isBypassed()) {
    console.warn("Warning: Notion worklog guard bypassed for this push.");
    console.warn("The pending record remains unsynchronized.");
    return;
  }

  if (getConfig("aiworklog.enabled").toLowerCase() !== "true") {
    throw new Error(
      'Notion worklog is not configured. Run: pnpm notion:setup -- "<your-personal-notion-subpage-url>"',
    );
  }

  if (!getConfig("aiworklog.notionPageUrl")) {
    throw new Error("The personal Notion target is missing. Run notion:setup again.");
  }

  const commit = process.argv[3] ? resolveCommit(process.argv[3]) : currentCommit();
  const state = readState();
  if (!state.records[commit]) {
    throw new Error(
      "Current commit has no verified Notion worklog. Use project-notion-worklog before push.",
    );
  }

  console.log(`Notion worklog verified for ${commit}.`);
  if (state.records[commit].recordUrl) {
    console.log(`Record: ${state.records[commit].recordUrl}`);
  }
}

function status() {
  const state = readState();
  const commit = currentCommit();
  const enabled = getConfig("aiworklog.enabled").toLowerCase() === "true";
  const target = getConfig("aiworklog.notionPageUrl") || "not configured";
  const record = state.records[commit];
  const synchronized = enabled && Boolean(record);

  console.log(`Enabled: ${enabled ? "yes" : "no"}`);
  console.log(`Target: ${target}`);
  console.log(`Current commit: ${commit}`);
  console.log(`Pending commit: ${state.pendingCommit ?? "none"}`);
  console.log(`Current commit synced: ${record ? "yes" : "no"}`);
  console.log(`Ready to push: ${synchronized ? "yes" : "no"}`);
  if (record?.recordUrl) {
    console.log(`Record: ${record.recordUrl}`);
  }
}

try {
  switch (command) {
    case "setup":
      setup();
      break;
    case "pending":
      markPending();
      break;
    case "mark":
      markSynced();
      break;
    case "check":
      check();
      break;
    case "status":
      status();
      break;
    default:
      throw new Error(
        "Use one of: setup <personal-page-url>, pending, mark <record-url>, check, status.",
      );
  }
} catch (error) {
  console.error(`Notion worklog: ${error.message}`);
  process.exit(1);
}
