#!/usr/bin/env bash
# Generates a 32-byte hex key for JARVIS_ENCRYPTION_KEY (AES-256-GCM).
set -euo pipefail
echo "JARVIS_ENCRYPTION_KEY=$(openssl rand -hex 32)"
