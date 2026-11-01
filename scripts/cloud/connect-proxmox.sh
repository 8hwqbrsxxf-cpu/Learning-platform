#!/usr/bin/env bash
# Verbindt per sessie met de Proxmox LXC en schrijft een SSH-alias "proxmox-lxc".
#
# Benodigde environment variables (zet ze in de environment settings, nooit in git):
#   LXC_HOST          IP of hostnaam van de LXC (Tailscale-IP/MagicDNS-naam, of publiek adres)
#   LXC_USER          SSH-gebruiker (default: root)
#   LXC_SSH_KEY_B64   private key, base64:  base64 -w0 ~/.ssh/id_ed25519_claude
#   LXC_PORT          SSH-poort (default: 22)
#   LXC_HOST_KEY      (aanbevolen) regel uit known_hosts: ssh-keyscan -t ed25519 <host>
#   TS_AUTHKEY        (enkel mode=tailscale) Tailscale auth key: reusable, ephemeral, getagd
#   LXC_MODE          tailscale (default) | direct
#
# Gebruik:  bash scripts/cloud/connect-proxmox.sh && ssh proxmox-lxc 'hostname'
set -euo pipefail

: "${LXC_HOST:?LXC_HOST ontbreekt}"
: "${LXC_SSH_KEY_B64:?LXC_SSH_KEY_B64 ontbreekt}"
LXC_USER="${LXC_USER:-root}"
LXC_PORT="${LXC_PORT:-22}"
LXC_MODE="${LXC_MODE:-tailscale}"
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

mkdir -p ~/.ssh && chmod 700 ~/.ssh
KEY=~/.ssh/id_proxmox_lxc
echo "$LXC_SSH_KEY_B64" | base64 -d > "$KEY"
chmod 600 "$KEY"

PROXY_LINE=""
if [ "$LXC_MODE" = "tailscale" ]; then
  : "${TS_AUTHKEY:?TS_AUTHKEY ontbreekt voor mode=tailscale}"
  if ! pgrep -x tailscaled >/dev/null; then
    $SUDO nohup tailscaled --tun=userspace-networking \
      --socks5-server=localhost:1055 \
      --state=mem: >/tmp/tailscaled.log 2>&1 &
    sleep 3
  fi
  $SUDO tailscale up --authkey="$TS_AUTHKEY" --hostname="claude-cloud-$(date +%s)" \
    --accept-dns=false --ssh=false
  # Userspace mode: SSH gaat via de SOCKS5-proxy van tailscaled
  PROXY_LINE="  ProxyCommand nc -X 5 -x localhost:1055 %h %p"
fi

# Host key pinnen (voorkomt MITM); zonder LXC_HOST_KEY wordt bij 1e connect geaccepteerd
if [ -n "${LXC_HOST_KEY:-}" ]; then
  echo "$LXC_HOST_KEY" >> ~/.ssh/known_hosts
  STRICT="yes"
else
  STRICT="accept-new"
  echo "WAARSCHUWING: LXC_HOST_KEY niet gezet, host key wordt niet vooraf gecontroleerd." >&2
fi

# Idempotent: oude alias vervangen
touch ~/.ssh/config
sed -i '/^# BEGIN proxmox-lxc/,/^# END proxmox-lxc/d' ~/.ssh/config
cat >> ~/.ssh/config <<EOF
# BEGIN proxmox-lxc
Host proxmox-lxc
  HostName ${LXC_HOST}
  User ${LXC_USER}
  Port ${LXC_PORT}
  IdentityFile ${KEY}
  IdentitiesOnly yes
  StrictHostKeyChecking ${STRICT}
  ServerAliveInterval 30
  ConnectTimeout 15
${PROXY_LINE}
# END proxmox-lxc
EOF
chmod 600 ~/.ssh/config

echo "Test verbinding..."
ssh -o BatchMode=yes proxmox-lxc 'echo "Verbonden met $(hostname) als $(whoami)"'
