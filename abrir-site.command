#!/bin/zsh

cd "$(dirname "$0")" || exit 1

PORT="${PORT:-8080}"

if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  open "http://localhost:$PORT"
  exit 0
fi

open "http://localhost:$PORT"
python3 -m http.server "$PORT"
