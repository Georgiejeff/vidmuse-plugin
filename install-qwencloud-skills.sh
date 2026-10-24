#!/usr/bin/env bash
set -euo pipefail

# Install the official QwenCloud AI Skills into this project.
# Requires Node.js 18+ and npm/npx.
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 18 or newer, then rerun this script." >&2
  exit 1
fi

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$node_major" -lt 18 ]; then
  echo "Node.js 18 or newer is required; detected $(node --version)." >&2
  exit 1
fi

npx -y skills add qwencloud/qwencloud-ai -y
echo
echo "QwenCloud AI Skills installation finished."
echo "Review installed skills before use. Configure QwenCloud credentials only through the official auth skill."
