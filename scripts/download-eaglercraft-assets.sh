#!/usr/bin/env bash
# =====================================================================
# ARCADE.OS — Large Game Asset Downloader
# =====================================================================
# This script fetches the Eaglercraft 26.1.2 assets.epk file (369 MB)
# which is excluded from git because it exceeds GitHub's 100MB file
# size limit.
#
# Usage:
#   bash scripts/download-eaglercraft-assets.sh
#
# After running this script, the Eaglercraft 26.1.2 game will be
# fully playable at /games/eaglercraft
# =====================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ARCADE.OS — Large Game Asset Downloader                   ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Resolve the project root (parent of the scripts/ directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$PROJECT_ROOT/public/games/eaglercraft"
TARGET_FILE="$TARGET_DIR/assets.epk"

# --- Eaglercraft 26.1.2 assets.epk ---
echo -e "${YELLOW}[1/1] Downloading Eaglercraft 26.1.2 assets.epk (369 MB)...${NC}"
echo "      Target: $TARGET_FILE"

if [ -f "$TARGET_FILE" ]; then
    EXISTING_SIZE=$(stat -c%s "$TARGET_FILE" 2>/dev/null || stat -f%z "$TARGET_FILE" 2>/dev/null || echo 0)
    if [ "$EXISTING_SIZE" -eq 369328189 ]; then
        echo -e "      ${GREEN}✓ Already present and correct size — skipping.${NC}"
        echo ""
        echo -e "${GREEN}✓ All assets present. The portal is ready to run.${NC}"
        exit 0
    else
        echo -e "      ${YELLOW}  Existing file is wrong size ($EXISTING_SIZE bytes) — re-downloading...${NC}"
        rm -f "$TARGET_FILE"
    fi
fi

mkdir -p "$TARGET_DIR"

# Google Drive file ID for the original eagle_crap_26.1.2.zip upload
# The assets.epk file is inside this zip; we download, extract, and clean up.
GDRIVE_FILE_ID="1hyrgKsDh-fkL1P39JN-gh4ZW8z1NC-A4"
GDRIVE_URL="https://drive.usercontent.google.com/download?id=${GDRIVE_FILE_ID}&export=download&confirm=t"

TEMP_ZIP="/tmp/eaglercraft_26_1_2.zip"

echo "      Downloading from Google Drive..."
curl -sSL -o "$TEMP_ZIP" "$GDRIVE_URL"

echo "      Extracting assets.epk from zip..."
unzip -o "$TEMP_ZIP" "assets.epk" -d "$TARGET_DIR" 2>/dev/null || {
    echo -e "      ${RED}✗ Failed to extract assets.epk from zip${NC}"
    echo -e "      ${YELLOW}  The zip may have downloaded incompletely. Try again or download manually:${NC}"
    echo "      $GDRIVE_URL"
    rm -f "$TEMP_ZIP"
    exit 1
}

rm -f "$TEMP_ZIP"

# Verify the file
if [ -f "$TARGET_FILE" ]; then
    FINAL_SIZE=$(stat -c%s "$TARGET_FILE" 2>/dev/null || stat -f%z "$TARGET_FILE" 2>/dev/null || echo 0)
    if [ "$FINAL_SIZE" -eq 369328189 ]; then
        echo -e "      ${GREEN}✓ Downloaded successfully ($((FINAL_SIZE / 1024 / 1024)) MB)${NC}"
    else
        echo -e "      ${YELLOW}⚠ Downloaded file is $FINAL_SIZE bytes (expected 369328189)${NC}"
        echo "        The game may not work correctly."
    fi
else
    echo -e "      ${RED}✗ assets.epk not found after extraction${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ All game assets downloaded successfully                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "The portal is now ready to run:"
echo "  npm install   # if you haven't already"
echo "  npm run dev   # start the dev server"
echo ""
echo "Then open http://localhost:3000 in your browser."
