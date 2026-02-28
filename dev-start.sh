#!/usr/bin/env bash
# =============================================================================
# dev-start.sh — Agrisense local dev stack launcher
#
# Usage:
#   chmod +x dev-start.sh   (first time only)
#   ./dev-start.sh          [--build] [--down] [--help]
#
# Options:
#   --build   Force a rebuild of the API Docker image before starting
#   --down    Tear down the stack instead of starting it
#   --help    Show this help message
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[agrisense]${RESET} $*"; }
success() { echo -e "${GREEN}[agrisense] ✔${RESET} $*"; }
warn()    { echo -e "${YELLOW}[agrisense] ⚠${RESET} $*"; }
error()   { echo -e "${RED}[agrisense] ✘${RESET} $*" >&2; }

# ── Defaults ──────────────────────────────────────────────────────────────────
BUILD=false
TEARDOWN=false

# ── Argument parsing ──────────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --build) BUILD=true ;;
    --down)  TEARDOWN=true ;;
    --help)
      grep '^#' "$0" | sed 's/^# \{0,\}//'
      exit 0
      ;;
    *)
      error "Unknown option: $arg  (use --help to see available options)"
      exit 1
      ;;
  esac
done

# ── Resolve script directory (repo root) ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        Agrisense Dev Stack Launcher      ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ── Pre-flight: check Docker is running ───────────────────────────────────────
if ! docker info > /dev/null 2>&1; then
  error "Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi
success "Docker is running."

# ── Tear-down mode ────────────────────────────────────────────────────────────
if [ "$TEARDOWN" = true ]; then
  info "Tearing down the stack..."
  docker compose down
  success "Stack stopped."
  exit 0
fi

# ── Load DOCKER_NETWORK_NAME from .env (fallback: agrisense_internal) ─────────
NETWORK_NAME="agrisense_internal"
if [ -f ".env" ]; then
  PARSED=$(grep -E '^DOCKER_NETWORK_NAME=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  [ -n "$PARSED" ] && NETWORK_NAME="$PARSED"
fi
info "Docker network: ${BOLD}${NETWORK_NAME}${RESET}"

# ── Ensure external network exists ────────────────────────────────────────────
if docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
  success "Network '${NETWORK_NAME}' already exists."
else
  info "Creating Docker network '${NETWORK_NAME}'..."
  docker network create "$NETWORK_NAME"
  success "Network '${NETWORK_NAME}' created."
fi

# ── Start the stack ───────────────────────────────────────────────────────────
if [ "$BUILD" = true ]; then
  info "Building API image and starting stack..."
  docker compose up -d --build
else
  info "Starting stack (use --build to force image rebuild)..."
  docker compose up -d
fi

echo ""
success "Stack is up! 🚀"
echo ""

# ── Print useful URLs from .env ───────────────────────────────────────────────
PORT=""
KONG_HTTP=""
SUPABASE_URL=""
if [ -f ".env" ]; then
  PORT=$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'" || true)
  KONG_HTTP=$(grep -E '^KONG_HTTP_PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'" || true)
  SUPABASE_URL=$(grep -E '^SUPABASE_PUBLIC_URL=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'" || true)
fi

echo -e "  ${BOLD}Agrisense API  ${RESET}→  http://localhost:${PORT:-3143}"
echo -e "  ${BOLD}Supabase Studio${RESET}→  ${SUPABASE_URL:-http://localhost:8000}"
echo ""
echo -e "  ${CYAN}Tip:${RESET} Run ${BOLD}docker compose logs -f api${RESET} to follow API logs."
echo -e "  ${CYAN}Tip:${RESET} Run ${BOLD}./dev-start.sh --down${RESET} to stop the stack."
echo ""
