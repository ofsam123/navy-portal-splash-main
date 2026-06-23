#!/usr/bin/env bash
set -euo pipefail

NODE22_BIN="/usr/local/opt/node@22/bin"

if [ -d "$NODE22_BIN" ]; then
  export PATH="$NODE22_BIN:$PATH"
fi

REQUIRED_MAJOR=22
REQUIRED_MINOR=12

IFS=. read -r major minor _ <<<"$(node -p "process.versions.node")"

if [ "$major" -lt "$REQUIRED_MAJOR" ] || { [ "$major" -eq "$REQUIRED_MAJOR" ] && [ "$minor" -lt "$REQUIRED_MINOR" ]; }; then
  echo "Error: Node.js $(node -v) is too old. This project requires Node >=${REQUIRED_MAJOR}.${REQUIRED_MINOR}.0." >&2
  echo "" >&2
  echo "Fix (Homebrew):" >&2
  echo '  export PATH="/usr/local/opt/node@22/bin:$PATH"' >&2
  echo "  # or permanently: brew link node@22 --force --overwrite" >&2
  echo "" >&2
  echo "Fix (nvm/fnm): use the version in .nvmrc (22)" >&2
  exit 1
fi

exec "$@"
