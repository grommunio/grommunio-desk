#!/usr/bin/env bash
# Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

# TODO: check that there are no unstaged changes to the files that will be committed

set -e

echo "=== Running pre-commit check ==="

diffFiles=$(git diff --cached --name-only --diff-filter=ACM | grep -E '.*(\.js|\.ts)x?$') || true
if [ ! -z "$diffFiles" ]; then
  npm test
fi

echo "=== Pre-commit check completed successfully ==="
