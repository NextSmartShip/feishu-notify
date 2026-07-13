#!/usr/bin/env bash

set -euo pipefail

scenario="${1:-}"
workflow_path=".github/workflows/local-notify-smoke.yml"
github_token="${GITHUB_TOKEN:-${GH_TOKEN:-local-act-token}}"
current_tag="${CURRENT_TAG:-v236}"
head_sha="${HEAD_SHA:-local-tag-smoke-sha}"
repo_full_name="NextSmartShip/wms-ui"
ref_json=""
ref_context=""

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
  tag-success)
    if [[ "$github_token" == "local-act-token" ]]; then
      echo "tag-success requires GITHUB_TOKEN or GH_TOKEN with repository read access" >&2
      exit 1
    fi
    run_id="125"
    job_id="458"
    conclusion="success"
    message="test: local tag release notification"
    repo_full_name="NextSmartShip/wms-ui (local smoke test)"
    ref_json=",
              \"ref\": \"refs/tags/${current_tag}\",
              \"ref_type\": \"tag\",
              \"head_sha\": \"${head_sha}\""
    ref_context="--env GITHUB_REF=refs/tags/${current_tag}"
    ;;
  *)
    echo "Usage: bash script/local-notify-smoke.sh <success|failure|tag-success>" >&2
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
          token: ${github_token}
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
                "full_name": "${repo_full_name}",
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
              ${ref_json}
            }
YAML

act workflow_dispatch \
  --workflows "$workflow_path" \
  --job notify \
  --pull=false \
  ${ref_context} \
  -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
