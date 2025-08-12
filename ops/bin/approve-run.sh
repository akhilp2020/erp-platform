#!/usr/bin/env bash
set -euo pipefail
PLAN="${1:-}"
if [[ -z "$PLAN" || ! -f "$PLAN" ]]; then
  echo "Usage: ops/bin/approve-run.sh ops/playbooks/<plan>.yml"
  exit 1
fi

echo "=== Preflight: git status (dirty files) ==="
git status --porcelain

echo
echo "=== Dry-run (no changes) ==="
ansible-playbook -i ops/inventory.ini "$PLAN" --check

echo
read -r -p "Proceed and APPLY changes? [y/N] " ans
if [[ ! "$ans" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

ts="$(date -u +%Y%m%dT%H%M%SZ)"
log="ops/logs/$(basename "$PLAN" .yml)-$ts.log"
echo "=== Running APPLY. Log: $log ==="
ansible-playbook -i ops/inventory.ini "$PLAN" | tee "$log"


echo
read -r -p "Run tests now? [y/N] " t
if [[ "$t" =~ ^[Yy]$ ]]; then
  echo "=== Running backend tests ==="
  (cd apps/backend && npm run -s test) || { echo "Backend tests failed"; exit 11; }

  # Run tenant unit + e2e (adjust tenant folder if you generate multiple)
  TENANT_DIR="apps/generated/demo-salon"
  if [[ -d "$TENANT_DIR" ]]; then
    echo "=== Running tenant unit tests ==="
    (cd "$TENANT_DIR" && npm run -s test) || { echo "Tenant unit tests failed"; exit 12; }
    echo "=== Running tenant e2e (Playwright) ==="
    (cd "$TENANT_DIR" && npm run -s e2e) || { echo "Tenant e2e failed"; exit 13; }
  fi
fi


echo
echo "=== Git diff (post-run) ==="
git status --porcelain
