#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/build"
DIST_DIR="$PROJECT_DIR/dist"

VERSION=$(node -p "require('$PROJECT_DIR/metadata.json').version" 2>/dev/null || echo "1")
VERSION_LEGACY=$(node -p "require('$PROJECT_DIR/metadata-legacy.json').version" 2>/dev/null || echo "1")

usage() {
    echo "Usage: $0 [modern|legacy|all]"
    echo "  modern  - Build for GNOME 45-49 (ESModules)"
    echo "  legacy  - Build for GNOME 42-44 (legacy imports)"
    echo "  all     - Build both versions (default)"
    exit 1
}

clean_build() {
    rm -rf "$BUILD_DIR" "$DIST_DIR"
    mkdir -p "$BUILD_DIR" "$DIST_DIR"
}

compile_schemas() {
    echo "Compiling GSettings schemas..."
    if command -v glib-compile-schemas &> /dev/null; then
        glib-compile-schemas "$PROJECT_DIR/schemas/" || true
    else
        echo "Warning: glib-compile-schemas not found, skipping schema compilation"
    fi
}

build_modern() {
    echo "Building modern version for GNOME 45-49..."

    local modern_dir="$BUILD_DIR/modern"
    local modern_dist="$DIST_DIR/netspeed-plus-gnome45-${VERSION}.shell-extension.zip"

    mkdir -p "$modern_dir"

    cp "$PROJECT_DIR/extension.js" "$modern_dir/"
    cp "$PROJECT_DIR/prefs.js" "$modern_dir/"
    cp "$PROJECT_DIR/metadata.json" "$modern_dir/"
    cp -r "$PROJECT_DIR/schemas" "$modern_dir/"

    mkdir -p "$modern_dir/src"
    cp "$PROJECT_DIR/src/"*.js "$modern_dir/src/"

    rm -f "$modern_dir/schemas/gschemas.compiled"

    cd "$modern_dir"
    zip -r "$modern_dist" . -x "*.git*" -x "*.DS_Store"
    echo "Created: $modern_dist"
}

build_legacy() {
    echo "Building legacy version for GNOME 42-44..."

    local legacy_dir="$BUILD_DIR/legacy"
    local legacy_dist="$DIST_DIR/netspeed-plus-gnome42-${VERSION_LEGACY}.shell-extension.zip"

    mkdir -p "$legacy_dir"

    cp "$PROJECT_DIR/legacy/extension.js" "$legacy_dir/"
    cp "$PROJECT_DIR/legacy/prefs.js" "$legacy_dir/"
    cp "$PROJECT_DIR/metadata-legacy.json" "$legacy_dir/metadata.json"
    cp -r "$PROJECT_DIR/schemas" "$legacy_dir/"

    if [ -f "$PROJECT_DIR/schemas/gschemas.compiled" ]; then
        cp "$PROJECT_DIR/schemas/gschemas.compiled" "$legacy_dir/schemas/"
    fi

    cd "$legacy_dir"
    zip -r "$legacy_dist" . -x "*.git*" -x "*.DS_Store"
    echo "Created: $legacy_dist"
}

validate_zip() {
    local zip_file="$1"
    local zip_name=$(basename "$zip_file")

    echo "Validating $zip_name..."

    if ! unzip -l "$zip_file" | grep -q "metadata.json"; then
        echo "Error: $zip_name missing metadata.json"
        return 1
    fi

    if ! unzip -l "$zip_file" | grep -q "extension.js"; then
        echo "Error: $zip_name missing extension.js"
        return 1
    fi

    echo "$zip_name validation passed"
}

case "${1:-all}" in
    modern)
        clean_build
        compile_schemas
        build_modern
        validate_zip "$DIST_DIR/netspeed-plus-gnome45-${VERSION}.shell-extension.zip"
        ;;
    legacy)
        clean_build
        compile_schemas
        build_legacy
        validate_zip "$DIST_DIR/netspeed-plus-gnome42-${VERSION_LEGACY}.shell-extension.zip"
        ;;
    all)
        clean_build
        compile_schemas
        build_modern
        build_legacy
        validate_zip "$DIST_DIR/netspeed-plus-gnome45-${VERSION}.shell-extension.zip"
        validate_zip "$DIST_DIR/netspeed-plus-gnome42-${VERSION_LEGACY}.shell-extension.zip"
        echo ""
        echo "Build complete! Artifacts in $DIST_DIR/"
        ;;
    *)
        usage
        ;;
esac