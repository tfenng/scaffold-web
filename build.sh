#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-scaffold-web}"
IMAGE_TAG="${1:-${IMAGE_TAG:-latest}}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-Dockerfile}"

docker build \
  -f "${DOCKERFILE_PATH}" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  .

echo "Built image: ${IMAGE_NAME}:${IMAGE_TAG}"
