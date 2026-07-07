#!/usr/bin/env bash

set -euo pipefail

scenario="${1:-}"
workflow_path=".github/workflows/local-notify-smoke.yml"

case "$scenario" in
  success)
    run_id="124"
    job_id="457"
    conclusion="success"
    message="test: local success notification"
    ;;
  failure)
    run_id="123"
    job_id="456"
    conclusion="failure"
    message="test: local failure notification"
    ;;
  *)
    echo "Usage: bash script/local-notify-smoke.sh <success|failure>" >&2
    exit 1
    ;;
esac

cleanup() {
  rm -f "$workflow_path"
}

trap cleanup EXIT

cat > "$workflow_path" <<YAML
name: Local Notify Smoke Test

on:
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./
        with:
          token: local-act-token
          target-group: personal
          workflow-run-json: |
            {
              "id": ${run_id},
              "event": "push",
              "head_branch": "master",
              "html_url": "https://github.com/NextSmartShip/wms-ui/actions/runs/${run_id}",
              "run_started_at": "2026-07-06T11:59:00Z",
              "head_commit": {
                "message": "${message}",
                "author": {
                  "name": "Local Tester",
                  "email": "local.tester@nextsmartship.com"
                }
              },
              "repository": {
                "name": "wms-ui",
                "full_name": "NextSmartShip/wms-ui",
                "owner": {
                  "login": "NextSmartShip"
                }
              },
              "triggering_actor": {
                "login": "wujiaqiang",
                "html_url": "https://github.com/wujiaqiang"
              },
              "jobs": [
                {
                  "name": "build",
                  "status": "completed",
                  "conclusion": "${conclusion}",
                  "html_url": "https://github.com/NextSmartShip/wms-ui/actions/runs/${run_id}/job/${job_id}"
                }
              ]
            }
YAML

act workflow_dispatch \
  --workflows "$workflow_path" \
  --job notify \
  --container-architecture linux/amd64 \
  -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
