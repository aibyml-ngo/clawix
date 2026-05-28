#!/bin/bash
set -e

BASE_URL="https://raw.githubusercontent.com/ClawixAI/clawix/main/docs"
docs="GET_STARTED.md CONFIG.md PROVIDERS.md AGENTS.md SKILLS.md MEMORY.md GOVERNANCE.md SECURITY.md MULTI-USERS.md SPEC.md"

for dir in "app/v1/content/docs" "app/v2/content/docs"; do
  mkdir -p "$dir"
  for file in $docs; do
    echo "Fetching $file → $dir..."
    curl -fsSL --retry 3 --retry-delay 2 "$BASE_URL/$file" -o "$dir/$file"
  done
done

echo "All docs fetched"
