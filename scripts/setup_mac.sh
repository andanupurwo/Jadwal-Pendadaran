#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKUP_FILE="$ROOT_DIR/backend/src/database/backup_latest.sql"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    return 1
  fi
}

echo "==> Checking prerequisites"
need_cmd node
need_cmd npm
need_cmd psql

if ! command -v psql >/dev/null 2>&1; then
  echo "Install PostgreSQL client tools first (psql/pg_dump)."
  echo "Suggested: brew install postgresql@17"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "==> Creating backend/.env from .env.example"
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

set -a
# shellcheck disable=SC1090
source "$BACKEND_DIR/.env"
set +a

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-jadwal_pendadaran}"
DB_PORT="${DB_PORT:-5432}"

echo "==> Installing backend dependencies"
(cd "$BACKEND_DIR" && npm install)

echo "==> Installing frontend dependencies"
(cd "$FRONTEND_DIR" && npm install)

echo "==> Initializing database (create if missing)"
(cd "$BACKEND_DIR" && npm run init-db)

if [ -f "$BACKUP_FILE" ]; then
  echo "==> Restoring database from backup"
  export PGPASSWORD="$DB_PASSWORD"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"
  unset PGPASSWORD
else
  echo "Backup file not found: $BACKUP_FILE"
  echo "Skipping restore."
fi

echo "==> Setup complete"
echo "Start backend: cd backend && npm start"
echo "Start frontend: cd frontend && npm run dev"
