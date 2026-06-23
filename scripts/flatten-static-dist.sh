#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
CLIENT="$DIST/client"

if [ ! -d "$CLIENT" ]; then
  echo "No dist/client directory found; skipping static dist flatten." >&2
  exit 0
fi

# Promote client build output to dist root for static hosting.
shopt -s dotglob
for entry in "$CLIENT"/*; do
  name="$(basename "$entry")"
  if [ -e "$DIST/$name" ]; then
    rm -rf "$DIST/$name"
  fi
  mv "$entry" "$DIST/$name"
done
shopt -u dotglob
rmdir "$CLIENT" 2>/dev/null || rm -rf "$CLIENT"
rm -rf "$DIST/server"

echo "Static dist ready at $DIST"
