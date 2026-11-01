#!/usr/bin/env bash
# Setup script voor de cloud environment (Claude Code on the web).
# Plak de INHOUD van dit bestand in: environment menu -> Edit -> Setup script.
#
# Let op: het setup script kan de environment variables/secrets NIET lezen.
# Het installeert enkel tools. De eigenlijke verbinding (sleutel, host, Tailscale
# login) gebeurt per sessie via scripts/cloud/connect-proxmox.sh.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

$SUDO apt-get update -y
$SUDO apt-get install -y --no-install-recommends \
  openssh-client netcat-openbsd curl ca-certificates jq rsync

# Tailscale (userspace networking: werkt ook zonder /dev/net/tun in de container)
if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | $SUDO sh
fi

mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "Proxmox tooling geïnstalleerd. Verbinden: bash scripts/cloud/connect-proxmox.sh"
