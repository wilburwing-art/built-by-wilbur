#!/usr/bin/env bash
# Vendor the Superpowers skill library (https://github.com/obra/superpowers)
# into .claude/skills so every Claude Code session in this repo picks it up,
# including Claude Code on the web where plugin install is not interactive.
#
# Usage: scripts/sync-superpowers.sh [ref]     (default ref: the pinned tag below)

set -euo pipefail

UPSTREAM="https://github.com/obra/superpowers.git"
REF="${1:-v6.4.1}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="${REPO_ROOT}/.claude/skills"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet --depth 1 --branch "$REF" "$UPSTREAM" "$TMP/superpowers"
COMMIT="$(git -C "$TMP/superpowers" rev-parse HEAD)"

# Wipe only the skills we vendor, so any hand-written repo skills survive.
for dir in "$TMP"/superpowers/skills/*/; do
  rm -rf "${SKILLS_DIR}/$(basename "$dir")"
done
mkdir -p "$SKILLS_DIR"
cp -R "$TMP"/superpowers/skills/* "$SKILLS_DIR"/
cp "$TMP/superpowers/LICENSE" "${SKILLS_DIR}/SUPERPOWERS-LICENSE"

# Upstream ships as a plugin, where skills are addressed as `superpowers:<name>`.
# Vendored as project skills they are addressed by bare name, so strip the
# plugin namespace from every cross-reference.
find "$SKILLS_DIR" -type f \( -name '*.md' -o -name '*.dot' \) -print0 \
  | xargs -0 sed -i 's/superpowers://g'

cat > "${SKILLS_DIR}/SUPERPOWERS-VERSION" <<META
source: ${UPSTREAM}
ref: ${REF}
commit: ${COMMIT}
synced: $(date -u +%Y-%m-%d)
note: vendored copy; do not edit by hand, re-run scripts/sync-superpowers.sh
META

echo "Synced Superpowers ${REF} (${COMMIT}) into .claude/skills"
