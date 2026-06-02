#!/usr/bin/env bash

if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
	echo "Error: Do not source this script. Run it as: ./deploy.sh" >&2
	return 1 2>/dev/null || exit 1
fi

set -Eeuo pipefail

log_error() {
	local exit_code="$1"
	local line="$2"
	local cmd="$3"
	printf '[%s] ERROR (exit %s) at line %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$exit_code" "$line" >&2
	printf 'Command: %s\n' "$cmd" >&2
}

trap 'log_error "$?" "$LINENO" "$BASH_COMMAND"' ERR

echo "This script will:\n1. Build the vue app.\n2. Remove existing project in 'www/html'.\n3. Copy new project to 'www/html'."

echo "[1/6] Build frontend vue app"
npm run build

echo "[2/6] Remove last backup"
sudo rm -rf /var/www/html_backup/*

echo "[3/6] Move old version to backup folder"
sudo mv /var/www/html/* /var/www/html_backup

echo "[4/6] Move new version to webroot"
sudo mv ~/sikka-buya/frontend/dist/* /var/www/html

echo "[5/6] Copy cms data from backup to production folder"
sudo mkdir -p /var/www/html/data/cms
sudo cp -a /var/www/html_backup/data/cms/. /var/www/html/data/cms/

owner_user="${SUDO_USER:-$USER}"
owner_group="$(id -gn "$owner_user")"
echo "[6/6] Set cms ownership to ${owner_user}:${owner_group}"
sudo chown -R "${owner_user}:${owner_group}" /var/www/html/

echo "Done! Thanks for deploying a new version of sikka:buya"
