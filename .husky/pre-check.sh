#!/usr/bin/env bash
# Copyright (c) 2020-2026 grommunio GmbH. All Rights Reserved.

set -e

echo "=== Running pre-commit check ==="

diffFiles=$(git diff --cached --name-only --diff-filter=ACM | grep -E 'src/.*(\.js|\.ts)x?$') || true
if [ ! -z "$diffFiles" ]; then
  npm test
fi

echo "=== Pre-commit check completed successfully ==="
