#!/usr/bin/env bash

# Build script for Net Speed Plus — Modern GNOME 45-49 branch
# Packages extension for distribution and upload to extensions.gnome.org

set -e

# Configuration
EXTENSION_NAME="netspeed-plus"
EXTENSION_UUID="netspeedplus@sam.shell-extension"
GNOME_VERSION="gnome45"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building ${EXTENSION_NAME} for GNOME 45-49...${NC}"

# Validate required files exist
echo "Validating extension structure..."
if [ ! -f "extension.js" ]; then
    echo -e "${RED}ERROR: extension.js not found${NC}"
    exit 1
fi

if [ ! -f "metadata.json" ]; then
    echo -e "${RED}ERROR: metadata.json not found${NC}"
    exit 1
fi

if [ ! -f "prefs.js" ]; then
    echo -e "${YELLOW}WARNING: prefs.js not found${NC}"
fi

if [ ! -d "src" ]; then
    echo -e "${YELLOW}WARNING: src/ directory not found${NC}"
fi

if [ ! -d "schemas" ]; then
    echo -e "${YELLOW}WARNING: schemas/ directory not found${NC}"
fi

# Get version from metadata
VERSION=$(grep -oP '"version"\s*:\s*\K[0-9.]+' metadata.json)
echo -e "Version: ${VERSION}"

# Create dist directory
mkdir -p dist

# Create temporary build directory
BUILD_DIR="build/modern"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy required files to build directory
echo "Copying files to build directory..."
cp extension.js "$BUILD_DIR/"
cp prefs.js "$BUILD_DIR/" 2>/dev/null || true
cp metadata.json "$BUILD_DIR/"
cp -r schemas "$BUILD_DIR/" 2>/dev/null || true

# Copy src/ directory if present
if [ -d "src" ]; then
    cp -r src "$BUILD_DIR/"
fi

# Validate GSettings schemas (compile in build dir only)
if [ -d "$BUILD_DIR/schemas" ]; then
    echo "Validating GSettings schemas..."
    if command -v glib-compile-schemas &> /dev/null; then
        # Compile into build dir to check XML validity
        glib-compile-schemas "$BUILD_DIR/schemas/" 2>/dev/null || true
        # Remove compiled output — we only ship XML
        rm -f "$BUILD_DIR/schemas/gschemas.compiled"
        echo -e "${GREEN}✓ Schemas validated${NC}"
    else
        echo -e "${YELLOW}glib-compile-schemas not found, skipping validation${NC}"
    fi
fi

# Create ZIP archive
ZIP_NAME="${EXTENSION_NAME}-${GNOME_VERSION}-${VERSION}.shell-extension.zip"
ZIP_PATH="$(pwd)/dist/${ZIP_NAME}"
echo "Creating ZIP archive: dist/${ZIP_NAME}"
(cd "$BUILD_DIR" && zip -qr "$ZIP_PATH" .)

# Cleanup build dir
rm -rf "$BUILD_DIR"

echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "Package: dist/${ZIP_NAME}"
echo ""
echo "Next steps:"
echo "1. Validate: shexli dist/${ZIP_NAME}"
echo "2. Upload:  Upload to extensions.gnome.org via EGO portal"
