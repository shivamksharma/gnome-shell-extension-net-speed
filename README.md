# Net Speed Plus — Legacy GNOME 42-44 Branch

**Real-time network speed indicator for GNOME Shell**

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-42--44-4A86CF?style=flat-square&logo=gnome&logoColor=white" alt="GNOME 42-44">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
</p>

---

## ⚠️ IMPORTANT: This is the LEGACY Branch

This branch (`legacy/gnome-42-44`) contains the **GNOME 42-44 compatible** version of Net Speed Plus using **classic GJS syntax**.

**For GNOME 45 and newer**, see the [modern branch](../modern/gnome-45-49/README.md) which uses ESModules.

---

## 📋 Table of Contents

- [Branch Purpose](#branch-purpose)
- [Features](#features)
- [Compatibility](#compatibility)
- [Legacy Architecture](#legacy-architecture)
- [Repository Structure](#repository-structure)
- [Development Setup](#development-setup)
- [Testing Workflow](#testing-workflow)
- [Packaging Workflow](#packaging-workflow)
- [Release Process](#release-process)
- [Shexli Validation](#shexli-validation)
- [Upload to GNOME Extensions](#upload-to-gnome-extensions)
- [Maintenance Notes](#maintenance-notes)
- [API Differences from Modern Branch](#api-differences-from-modern-branch)
- [Contributing](#contributing)
- [License](#license)

---

## Branch Purpose

This legacy branch exists to support users still running **GNOME Shell 42, 43, or 44**. These versions use the **classic GJS module system** (pre-ESModules) and require a different extension entry point and import syntax.

**Do not use this branch if:**
- You are running GNOME 45 or newer → use `modern/gnome-45-49`
- You want to develop for GNOME 45+ → work in `modern/gnome-45-49`

---

## Features

- 📊 Real-time download/upload speed display
- 🔍 Automatic active interface detection
- 🚫 Smart filtering of virtual interfaces (Docker, VPN, loopback)
- ⚙️ GTK4 preferences UI
- 📏 Adaptive unit conversion (Auto/KB/s/MB/s)
- ⏱️ Configurable update intervals (0.5s - 5s)
- 🎯 Lightweight, minimal resource usage

---

## Compatibility

| GNOME Shell Version | Supported | Branch |
|---------------------|-----------|--------|
| 42                  | ✅ Yes    | legacy/gnome-42-44 |
| 43                  | ✅ Yes    | legacy/gnome-42-44 |
| 44                  | ✅ Yes    | legacy/gnome-42-44 |
| 45+                 | ❌ No     | Use modern/gnome-45-49 |

**Minimum GNOME:** 42  
**Maximum GNOME:** 44 (inclusive)

---

## Legacy Architecture

### Classic GJS Module System

This branch uses **GJS classic imports** (pre-ESModules):

```javascript
// Legacy imports using imports.gi
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Main = imports.ui.main;

// Global extension lifecycle functions
function init() { }
function enable() { /* ... */ }
function disable() { /* ... */ }
```

### Extension Lifecycle

GNOME 42-44 extensions use **module-level functions**:
- `init()` — called once when extension system loads (optional)
- `enable()` — called when user enables extension; must set up UI
- `disable()` — called when user disables; must clean up all resources

### UI Parent Class

The indicator extends `PanelMenu.Button`, which provides:
- Automatic panel placement
- Built-in popup menu support (unused here)
- Proper actor cleanup on destroy

### Settings Access

Uses `ExtensionUtils.getSettings('org.gnome.shell.extensions.netspeed_plus')` to retrieve GSettings schema.

### No ESModules

This branch **never** uses:
- `import` / `export` syntax
- `resource:///` URIs
- `export default class Extension` pattern
- ES6 module features (static imports, top-level await)

---

## Repository Structure

```
legacy/gnome-42-44/
├── extension.js              # Main runtime (288 lines, classic GJS)
├── prefs.js                  # Preferences UI (197 lines, GTK4)
├── metadata.json             # Extension metadata (shell-version: 42-44)
├── schemas/
│   └── org.gnome.shell.extensions.netspeed_plus.gschema.xml
├── scripts/
│   └── build.sh              # Build/packaging script
├── .gitignore                # Excludes build artifacts
├── LICENSE                   # GPL-3.0
└── README.md                 # This file (legacy-specific)
```

**Not present:**
- `src/` directory (modular architecture only in modern branch)
- `metadata-legacy.json` (redundant, removed)
- Build outputs (`build/`, `dist/`) — generated during release
- Compile outputs (`locale/`, `prefs/`, `gschemas.compiled`) — generated

---

## Development Setup

### Prerequisites

- GNOME Shell 42, 43, or 44
- GJS development headers (typically `gir1.2-gnomeshell-3.0` or similar)
- GTK4
- `glib-compile-schemas` (for schema validation)

### Cloning

```bash
# Clone the repository
git clone https://github.com/shivamksharma/gnome-shell-extension-net-speed.git
cd gnome-shell-extension-net-speed

# Switch to legacy branch
git switch legacy/gnome-42-44
```

### Directory Layout for Installation

Your local extension directory (what gets installed):
```
~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
├── extension.js
├── prefs.js
├── metadata.json
└── schemas/
    └── org.gnome.shell.extensions.netspeed_plus.gschema.xml
```

---

## Testing Workflow

### Manual Testing (GNOME Shell X11)

```bash
# 1. Copy extension files to local extensions directory
cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/

# 2. Compile GSettings schemas (validates XML)
glib-compile-schemas ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/schemas/

# 3. Restart GNOME Shell (X11)
# Press Alt+F2, type 'r', press Enter

# 4. Enable extension
gnome-extensions enable netspeedplus@sam.shell-extension

# 5. Check status
gnome-extensions info netspeedplus@sam.shell-extension
```

### Manual Testing (Wayland)

Wayland does not support `Alt+F2 r` restart. You must logout and login, or restart the entire session.

```bash
# Enable extension
gnome-extensions enable netspeedplus@sam.shell-extension

# Restart the shell via systemd user service (careful — this kills your session)
# systemctl --user restart gnome-shell

# Or simply log out and log back in
```

### Debugging

```bash
# View GNOME Shell logs in real-time
journalctl -f -o cat /usr/bin/gnome-shell

# For Wayland sessions:
journalctl -f -o cat --user-unit=gnome-shell

# Filter for extension logs (our code uses log('NetSpeed: ...'))
journalctl -f -o cat /usr/bin/gnome-shell | grep 'NetSpeed'
```

### Disable on Crash

If the extension crashes and you can't access the panel:

```bash
# Disable from terminal
gnome-extensions disable netspeedplus@sam.shell-extension

# Or remove the directory
rm -rf ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
```

---

## Packaging Workflow

### Build Script

We provide `scripts/build.sh` to create a release package:

```bash
# Make it executable (first time only)
chmod +x scripts/build.sh

# Run build
./scripts/build.sh
```

**What it does:**
1. Validates required files (`extension.js`, `metadata.json`, `prefs.js`, `schemas/`)
2. Extracts version from `metadata.json`
3. Compiles GSettings schemas to check XML validity
4. Copies files to temporary `build/legacy/`
5. Creates ZIP archive in `dist/`:
   ```
   dist/netspeed-plus-gnome42-<version>.shell-extension.zip
   ```
6. Cleans up temporary build directory

**Output structure inside ZIP:**
```
netspeedplus@sam.shell-extension/
├── extension.js
├── prefs.js
├── metadata.json
└── schemas/
    └── org.gnome.shell.extensions.netspeed_plus.gschema.xml
```

This matches the expected installation layout.

---

## Release Process

### Versioning

We follow **semantic versioning**:
- **Major** (e.g., 2 → 3): Breaking changes, GNOME version drops
- **Minor** (e.g., 3.0 → 3.1): New features
- **Patch** (e.g., 3.1.0 → 3.1.1): Bug fixes

**Important:** Version numbers are **independent** between `legacy` and `modern` branches. The GNOME portal treats them as separate packages distinguished by their `shell-version` field in `metadata.json`.

### Steps to Release

1. **Ensure you're on the correct branch:**
   ```bash
   git switch legacy/gnome-42-44
   ```

2. **Update version** in `metadata.json`:
   ```json
   "version": 3.1.0
   ```

3. **Commit with conventional commit:**
   ```bash
   git add metadata.json
   git commit -m "chore: bump version to 3.1.0 for GNOME 42-44 release"
   ```

4. **Tag the commit** (optional but recommended):
   ```bash
   git tag v3.1.0-legacy
   git push origin --tags
   ```

5. **Build the package:**
   ```bash
   ./scripts/build.sh
   # Output: dist/netspeed-plus-gnome42-3.1.0.shell-extension.zip
   ```

6. **Validate with Shexli** (see below)

7. **Upload to GNOME Extensions** via EGO portal.

---

## Shexli Validation

[Shexli](https://github.com/brunelli/shexli) is the GNOME Shell Extension Linter and Installer. It validates package structure and metadata.

### Install Shexli

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install/upgrade shexli
pip install -U shexli
```

### Run Validation

```bash
# Validate the built ZIP
shexli dist/netspeed-plus-gnome42-3.1.0.shell-extension.zip

# OR validate the source directory directly
shexli .
```

**Shexli checks:**
- Required files present (`extension.js` or `extension`, `metadata.json`)
- Valid JSON metadata
- Correct UUID format
- Schema XML syntax
- Duplicate UUID detection
- Structure matches installation layout

**Fix any warnings or errors before uploading.**

---

## Upload to GNOME Extensions

1. Go to [extensions.gnome.org/developers](https://extensions.gnome.org/developers/)
2. Log in with your GNOME account
3. Select "Net Speed Plus" from your extensions
4. Click "Upload new version"
5. Choose the ZIP file from `dist/`
6. Fill in release notes
7. Submit for review

**Review time:** Usually 1-3 business days.

**Common rejection reasons to avoid:**
- ❌ Missing `metadata.json` → ensure it's present
- ❌ Invalid UUID format → `netspeedplus@sam.shell-extension` is correct
- ❌ Schema XML errors → run `glib-compile-schemas` to check
- ❌ Wrong ZIP root → shexli ensures correct structure
- ❌ Uses unsupported APIs → we only use stable GNOME 42-44 APIs

---

## Maintenance Notes

### This Branch Is Legacy

- **No new features** will be added to this branch unless they are critical and backported from modern.
- **Only critical bug fixes** and security patches will be backported.
- **No GNOME 45+ features** — those belong exclusively to `modern/gnome-45-49`.

### Backporting From Modern

If a fix is made in `modern/gnome-45-49` that also applies to legacy:

1. Cherry-pick the commit to `legacy/gnome-42-44`
2. Adapt any API differences (ESModules vs classic imports)
3. Update version in `metadata.json`
4. Build and release separately

### When to Create a New Branch

If GNOME 50 introduces another breaking change:
- `modern/gnome-45-49` may need updating or replacement
- `legacy/gnome-42-44` will remain unchanged (GNOME 42-44 still don't change)

### End-of-Life Plan

This branch will be retired when:
- GNOME 42-44 are no longer widely used (likely 2027+)
- Maintenance burden outweighs user benefit

At EOL, we may:
- Archive this branch (no more commits)
- Update README to point users to `modern/` only
- Close PRs targeting this branch

---

## API Differences from Modern Branch

| Feature | Legacy (This Branch) | Modern (GNOME 45+) |
|---------|---------------------|-------------------|
| Module system | Classic GJS (`imports.gi`) | ESModules (`import`) |
| Entry point | `enable()` / `disable()` functions | `class Extension` with methods |
| Settings | `ExtensionUtils.getSettings()` | `this._settings` injected |
| UI parent | `PanelMenu.Button` extends | `GObject.Object` + `.getActor()` |
| Preferences | `buildPrefsWidget()` | `getPreferencesWidget()` |
| Import syntax | `const Main = imports.ui.main` | `import Main from 'resource:///...'` |

**Do not mix these patterns in this branch.**

---

## Contributing

### Reporting Issues

When filing an issue, include:
- GNOME Shell version: `gnome-shell --version`
- Distribution and version
- Steps to reproduce
- Relevant log output from `journalctl`

### Submitting Patches

1. **Work on the correct branch:**
   ```bash
   git switch legacy/gnome-42-44
   git checkout -b fix/network-interface-detection
   ```

2. **Make changes** — keep code style consistent:
   - Use classic GJS imports (`imports.gi.*`)
   - No `import`/`export` statements
   - Follow existing indentation (4 spaces, no tabs)
   - Add comments for non-obvious logic

3. **Test on GNOME 42-44** — verify no regressions

4. **Update version** if fixing a release-critical bug

5. **Commit with descriptive message:**
   ```bash
   git add .
   git commit -m "fix: handle network interface detection race condition"
   ```

6. **Push and open PR:**
   ```bash
   git push origin fix/network-interface-detection
   # Then open PR on GitHub targeting legacy/gnome-42-44
   ```

### Cross-Branch Changes

If your change affects both legacy and modern:

1. Implement in `modern/gnome-45-49` first (modern APIs first)
2. Then **backport** to `legacy/gnome-42-44` with appropriate syntax changes
3. Two separate PRs or a multi-branch PR explaining both

**Do not merge cross-branch changes without explicit reviewer approval.**

---

## License

**GNU General Public License v3.0** — see [LICENSE](../LICENSE) for details.

*Not affiliated with or endorsed by the GNOME Project. Community maintained.*

---

## Quick Reference

| Task | Command |
|------|---------|
| Switch to this branch | `git switch legacy/gnome-42-44` |
| Build package | `./scripts/build.sh` |
| Validate with shexli | `shexli .` or `shexli dist/*.zip` |
| Install locally | `cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/` |
| Enable extension | `gnome-extensions enable netspeedplus@sam.shell-extension` |
| View logs | `journalctl -f -o cat /usr/bin/gnome-shell` |
| Disable on crash | `gnome-extensions disable netspeedplus@sam.shell-extension` |

---

*Legacy branch maintenance — Last updated: 2026-05-13*
