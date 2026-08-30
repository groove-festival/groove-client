#!/usr/bin/env sh
set -eu

mode=${1:-check}
case "$mode" in
  sync|check) ;;
  *)
    printf '%s\n' "usage: $0 [sync|check]" >&2
    exit 2
    ;;
esac

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
source_root="$repo_root/.agents/skills"
target_root="$repo_root/.claude/skills"
manifest="$source_root/managed-skills.txt"

fail() {
  printf '%s\n' "agent-skills: $1" >&2
  exit 1
}

frontmatter_value() {
  key=$1
  file=$2
  tr -d '\r' < "$file" | awk -v key="$key" '
    NR == 1 {
      if ($0 != "---") exit 2
      in_frontmatter = 1
      next
    }
    in_frontmatter && $0 == "---" { exit }
    in_frontmatter && index($0, key ":") == 1 {
      sub(/^[^:]+:[[:space:]]*/, "")
      print
      exit
    }
  '
}

validate_skill() {
  name=$1
  root=$2
  skill_file="$root/$name/SKILL.md"

  [ -f "$skill_file" ] || fail "missing SKILL.md: $skill_file"
  tr -d '\r' < "$skill_file" | awk '
    NR == 1 {
      if ($0 != "---") exit 1
      next
    }
    $0 == "---" { found = 1; exit }
    END { if (!found) exit 1 }
  ' || fail "invalid YAML frontmatter delimiters: $skill_file"

  declared_name=$(frontmatter_value name "$skill_file") ||
    fail "cannot read frontmatter name: $skill_file"
  description=$(frontmatter_value description "$skill_file") ||
    fail "cannot read frontmatter description: $skill_file"
  unexpected_keys=$(tr -d '\r' < "$skill_file" | awk '
    NR == 1 { in_frontmatter = 1; next }
    in_frontmatter && $0 == "---" { exit }
    in_frontmatter && $0 ~ /^[A-Za-z0-9_-]+:/ {
      key = $0
      sub(/:.*/, "", key)
      if (key != "name" &&
          key != "description" &&
          key != "license" &&
          key != "compatibility" &&
          key != "metadata" &&
          key != "allowed-tools") {
        print key
      }
    }
  ')
  [ -z "$unexpected_keys" ] ||
    fail "unexpected frontmatter key(s) in $skill_file: $unexpected_keys"

  [ "$declared_name" = "$name" ] ||
    fail "frontmatter name does not match directory '$name': $skill_file"
  [ "${#declared_name}" -le 64 ] ||
    fail "frontmatter name exceeds 64 characters: $skill_file"
  [ -n "$description" ] ||
    fail "frontmatter description is missing: $skill_file"
  [ "${#description}" -le 1024 ] ||
    fail "frontmatter description exceeds 1024 characters: $skill_file"
  case "$description" in
    *"<"*|*">"*) fail "frontmatter description contains an angle bracket: $skill_file" ;;
    "[TODO:"*) fail "frontmatter description contains an unfinished TODO: $skill_file" ;;
  esac
}

[ -f "$manifest" ] || fail "missing manifest: $manifest"
if [ "$mode" = "sync" ]; then
  mkdir -p "$target_root"
fi

count=0
seen_names=""
while IFS= read -r raw_line || [ -n "$raw_line" ]; do
  name=$(printf '%s' "$raw_line" | tr -d '\r' |
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  case "$name" in
    ""|\#*) continue ;;
  esac

  printf '%s\n' "$name" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$' ||
    fail "invalid skill name in manifest: $name"
  [ "$name" != "synced" ] ||
    fail "the reserved Claude skill name 'synced' cannot be managed"
  case "
$seen_names
" in
    *"
$name
"*) fail "duplicate skill in manifest: $name" ;;
  esac
  seen_names="$seen_names
$name"

  source="$source_root/$name"
  target="$target_root/$name"
  validate_skill "$name" "$source_root"

  if [ "$mode" = "sync" ]; then
    rm -rf -- "$target"
    mkdir -p "$target"
    cp -R "$source/." "$target/"
  fi

  [ -d "$target" ] || fail "missing Claude copy: $target"
  diff -r "$source" "$target" >/dev/null ||
    fail "content drift for $name"
  count=$((count + 1))
done < "$manifest"

[ "$count" -gt 0 ] || fail "manifest contains no managed skills"
if [ "$mode" = "sync" ]; then
  printf '%s\n' "SYNCED: $count managed skill(s) to .claude/skills."
fi
printf '%s\n' "PASS: $count managed skill(s) have valid frontmatter and no drift."
