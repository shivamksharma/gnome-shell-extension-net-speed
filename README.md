# Net Speed Plus — Modern GNOME 45-49 Branch

**Real-time network speed indicator for GNOME Shell**

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-45--49-4A86CF?style=flat-square&logo=gnome&logoColor=white" alt="GNOME 45-49">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
</p>

---

## ⚠️ IMPORTANT: This is the MODERN Branch

This branch (`modern/gnome-45-49`) contains the **GNOME 45-49 compatible** version of Net Speed Plus using **modern ESModules architecture**.

**For GNOME 42-44**, see the [legacy branch](../legacy/gnome-42-44/README.md) which uses classic GJS syntax.

---

## 📋 Table of Contents

- [Branch Purpose](#branch-purpose)
- [Features](#features)
- [Compatibility](#compatibility)
- [Modern Architecture](#modern-architecture)
- [Repository Structure](#repository-structure)
- [Development Setup](#development-setup)
- [Testing Workflow](#testing-workflow)
- [Packaging Workflow](#packaging-workflow)
- [Release Process](#release-process)
- [Shexli Validation](#shexli-validation)
- [Upload to GNOME Extensions](#upload-to-gnome-extensions)
- [ESModules Migration Notes](#esmodules-migration-notes)
- [API Reference](#api-reference)
- [Performance Notes](#performance-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Branch Purpose

This modern branch exists to support **GNOME Shell 45, 46, 47, 48, and 49**. These versions require **ESModules** syntax and use the new `Extension` class-based lifecycle.

This is the **primary development branch**. New features and fixes land here first, then may be backported to `legacy/gnome-42-44` if applicable.

---

## Features

- 📊 Real-time download/upload speed display in top panel
- 🔍 Automatic active interface detection via `ip route`
- 🚫 Smart virtual interface filtering (Docker, VPN, loopback)
- ⚙️ GTK4 preferences with modern styling
- 📏 Adaptive unit conversion (Auto/KB/s/MB/s)
- ⏱️ Configurable update intervals (0.5s - 5s)
- 🧩 Modular architecture (separate indicator, monitor, formatter)
- 🚀 Lightweight, efficient, ESModules-based

---

## Compatibility

| GNOME Shell Version | Supported | Branch |
|---------------------|-----------|--------|
| 45                  | ✅ Yes    | modern/gnome-45-49 |
| 46                  | ✅ Yes    | modern/gnome-45-49 |
| 47                  | ✅ Yes    | modern/gnome-45-49 |
| 48                  | ✅ Yes    | modern/gnome-45-49 |
| 49                  | ✅ Yes    | modern/gnome-45-49 |
| 42-44               | ❌ No     | Use legacy/gnome-42-44 |

**Minimum GNOME:** 45  
**Maximum GNOME:** 49 (inclusive)

---

## Modern Architecture

### ESModules System

GNOME 45+ replaced classic GJS imports with standard JavaScript ESModules:

```javascript
// Modern imports using ESModules syntax
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import St from 'resource:///org/gnome/shell/ui/st.js';
import Main from 'resource:///org/gnome/shell/ui/main.js';
import GLib from 'gi://GLib';
```

### Extension Class

Instead of global `enable()`/`disable()` functions, modern extensions **extend the `Extension` class**:

```javascript
export default class NetSpeedExtension extends Extension {
    enable() {
        // Setup UI, start timers
    }

    disable() {
        // Clean up resources
    }
}
```

The `this._settings` property is automatically injected by the base `Extension` class.

### Settings Access

Two options:

1. **Injected property** (available in `enable()`/`disable()`):
   ```javascript
   this._settings.get_boolean('show-download')
   ```

2. **Utility function** (standalone):
   ```javascript
   import { getSettings } from 'resource:///org/gnome/shell/extensions/extension.js';
   const settings = getSettings('org.gnome.shell.extensions.netspeed_plus')
   ```

Both are valid. This project uses injected `this._settings` in the extension class and `getSettings()` in prefs.

### Module Structure

The `src/` directory contains modular, testable components:

```
src/
├── constants.js      # Centralized constants & settings keys
├── formatter.js      # Speed formatting & display text
├── indicator.js      # NetSpeedIndicator (UI component)
├── networkMonitor.js # Network statistics polling
└── utils.js          # GLib helper wrappers (spawn, file reads, time)
```

This separation:
- Improves code readability
- Enables unit testing of pure functions
- Isolates system I/O into dedicated classes
- Makes maintenance easier

### Preferences ESModule

Preferences must export `buildPrefsWidget()` as a function:

```javascript
import Gtk from 'gi://Gtk';
import { getSettings } from 'resource:///org/gnome/shell/extensions/extension.js';

export function buildPrefsWidget() {
    const settings = getSettings('org.gnome.shell.extensions.netspeed_plus');
    // Build and return Gtk.Widget
    return widget;
}
```

No `init()` needed for prefs in GNOME 45+.

---

## Repository Structure

```
modern/gnome-45-49/
├── extension.js              # ESModule entry point (29 lines)
├── prefs.js                  # ESModule preferences (193 lines)
├── metadata.json             # GNOME 45-49 metadata
├── README.md                 # This file (modern-specific)
├── .gitignore                # Excludes build artifacts
├── LICENSE                   # GPL-3.0
├── schemas/
│   └── org.gnome.shell.extensions.netspeed_plus.gschema.xml
├── scripts/
│   └── build.sh              # Modern-only packaging script
└── src/
    ├── constants.js          # Exports: UNIT_MODE, SETTINGS_KEYS, etc.
    ├── formatter.js          # Exports: formatSpeed(), formatDisplayText()
    ├── indicator.js          # Exports: NetSpeedIndicator (GObject class)
    ├── networkMonitor.js     # Exports: NetworkMonitor class
    └── utils.js              # Exports: spawnCommandSync, readFileSync, time helpers
```

**Not present:**
- No `legacy/` directory
- No `metadata-legacy.json`
- No classic GJS files
- No build outputs (generated during release)

---

## Development Setup

### Prerequisites

- GNOME Shell 45, 46, 47, 48, or 49
- GJS with ESModules support (built into GNOME 45+)
- GTK4 for preferences
- `glib-compile-schemas` for schema validation

### Cloning

```bash
git clone https://github.com/shivamksharma/gnome-shell-extension-net-speed.git
cd gnome-shell-extension-net-speed

# Switch to modern branch
git switch modern/gnome-45-49
```

---

## Testing Workflow

### Local Installation

```bash
# Copy extension to local extensions directory
cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/

# Compile GSettings schemas
glib-compile-schemas ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/schemas/

# Restart GNOME Shell (X11 only)
# Alt+F2, type 'r', press Enter

# Enable extension
gnome-extensions enable netspeedplus@sam.shell-extension

# Check status
gnome-extensions info netspeedplus@sam.shell-extension
```

### Wayland Note

Wayland does not support `Alt+F2 r`. You must:
- Log out and log back in, OR
- Restart the user systemd service: `systemctl --user restart gnome-shell` (destructive)

### Debugging

```bash
# View GNOME Shell logs
journalctl -f -o cat /usr/bin/gnome-shell

# For Wayland sessions:
journalctl -f -o cat --user-unit=gnome-shell

# Filter extension logs
journalctl -f -o cat /usr/bin/gnome-shell | grep 'NetSpeed'
```

### Disable on Crash

If the extension crashes:

```bash
gnome-extensions disable netspeedplus@sam.shell-extension
# Or remove the directory
rm -rf ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
```

---

## Packaging Workflow

### Build Script

Run the included `scripts/build.sh`:

```bash
chmod +x scripts/build.sh  # First time only
./scripts/build.sh
```

**What it does:**
1. Validates required files (extension.js, metadata.json, prefs.js, src/, schemas/)
2. Extracts version from `metadata.json`
3. Compiles GSettings schemas in temp dir to validate XML
4. Copies files to temporary `build/modern/`
5. Creates ZIP in `dist/`:
   ```
   dist/netspeed-plus-gnome45-<version>.shell-extension.zip
   ```
6. Cleans up temporary build directory
7. Outputs validation instructions

### ZIP Structure

The generated ZIP contains:

```
netspeedplus@sam.shell-extension/
├── extension.js
├── prefs.js
├── metadata.json
├── schemas/
│   └── org.gnome.shell.extensions.netspeed_plus.gschema.xml
└── src/
    ├── constants.js
    ├── formatter.js
    ├── indicator.js
    ├── networkMonitor.js
    └── utils.js
```

This structure matches GNOME Shell's extension loader expectations for ESModules.

---

## Release Process

### Versioning

Semantic versioning in `metadata.json`:
- **Major** (2→3): Breaking changes, GNOME version drops
- **Minor** (3.0→3.1): New features
- **Patch** (3.1.0→3.1.1): Bug fixes

**Note:** Versions are **independent** between `legacy` and `modern` branches. GNOME portal treats them as separate packages based on `shell-version`.

### Steps to Release

1. **On modern branch:**
   ```bash
   git switch modern/gnome-45-49
   ```

2. **Update version** in `metadata.json`:
   ```json
   "version": 3.1.0
   ```

3. **Commit:**
   ```bash
   git add metadata.json
   git commit -m "chore: bump version to 3.1.0 for GNOME 45-49 release"
   ```

4. **Tag (optional):**
   ```bash
   git tag v3.1.0-modern
   git push origin --tags
   ```

5. **Build:**
   ```bash
   ./scripts/build.sh
   # Output: dist/netspeed-plus-gnome45-3.1.0.shell-extension.zip
   ```

6. **Validate with Shexli**

7. **Upload via EGO portal**

---

## Shexli Validation

[Shexli](https://github.com/brunelli/shexli) validates extension structure.

### Install

```bash
python3 -m venv venv
source venv/bin/activate
pip install -U shexli
```

### Run

```bash
shexli dist/netspeed-plus-gnome45-3.1.0.shell-extension.zip
# OR
shexli .
```

**Shexli checks:**
- Required files present
- Valid JSON metadata
- Correct UUID format
- Schema XML syntax
- No duplicate UUIDs
- Proper extension directory structure

Fix any issues before uploading.

---

## Upload to GNOME Extensions

1. Visit [extensions.gnome.org/developers](https://extensions.gnome.org/developers/)
2. Log in with GNOME account
3. Select "Net Speed Plus"
4. Click "Upload new version"
5. Choose the ZIP from `dist/`
6. Add release notes
7. Submit for review

**Review typically takes 1-3 business days.**

**Avoid these rejections:**
- ❌ Missing metadata.json → ensure present
- ❌ Invalid UUID → `netspeedplus@sam.shell-extension` is correct
- ❌ Bad schema XML → run `glib-compile-schemas` to check
- ❌ Wrong ZIP root → shexli ensures correct structure
- ❌ Unsupported APIs → we only use stable GNOME 45-49 APIs

---

## ESModules Migration Notes

### Why ESModules?

GNOME 45 replaced the classic GJS loader with a standard JavaScript ESModules implementation. This change:

- **Aligns with web standards** — `import`/`export` syntax
- **Enables tooling** — modern bundlers, linters, type checkers
- **Improves maintainability** — explicit dependencies, no global namespace pollution
- **Requires rewrite** — classic `imports.gi` syntax no longer works

### Key Changes from Legacy

| Legacy (GNOME 42-44) | Modern (GNOME 45+) |
|---------------------|--------------------|
| `const GLib = imports.gi.GLib` | `import GLib from 'gi://GLib'` |
| `function enable() { ... }` | `export default class Extension { enable() { ... } }` |
| `Main.panel.addToStatusArea()` | `Main.panel.addToStatusArea()` (same, but `this._settings` injected) |
| `PanelMenu.Button` base class | `GObject.Object` base with `.getActor()` pattern |
| `ExtensionUtils.getSettings()` | `this._settings` (injected) or `getSettings()` |
| `buildPrefsWidget()` with GTK4 | Same function but ESModule export |

### Migration Checklist

If backporting from modern to legacy or vice versa:

- [ ] Replace all `import`/`export` with classic GJS `const X = imports.gi.X`
- [ ] Replace `resource:///` URIs with `imports.ui.*`, `imports.gi.*`
- [ ] Convert `class Extension` to global `enable()`/`disable()` functions
- [ ] Replace `this._settings` with `ExtensionUtils.getSettings('uuid')`
- [ ] Change base class from `GObject.Object` to `PanelMenu.Button` (if UI)
- [ ] Remove `getActor()` indirection, use widget directly
- [ ] Update `prefs.js` to match corresponding preferences pattern

---

## API Reference

### Extension Lifecycle

| Method | When Called | Purpose |
|--------|-------------|---------|
| `enable()` | User enables extension | Create UI, start timers, connect signals |
| `disable()` | User disables extension | Destroy UI, stop timers, disconnect signals |
| `_init()` (optional) | Extension loaded | One-time initialization (rarely needed) |

### Indicator Pattern

Modern extensions create an actor via `getActor()`:

```javascript
export const NetSpeedIndicator = GObject.registerClass(
class NetSpeedIndicator extends GObject.Object {
    constructor(settings) {
        super();
        this._settings = settings;
        this._container = null;
        this._label = null;
    }

    setupUI() {
        this._label = new St.Label({ text: '—' });
        this._container = new St.BoxLayout();
        this._container.add_child(this._label);
    }

    getActor() {
        if (!this._container) this.setupUI();
        return this._container;
    }

    start() {
        // Start timer, connect signals
    }

    destroy() {
        // Cleanup
    }
}
```

### Timer Management

Use `GLib.timeout_add()`:

```javascript
_startTimer() {
    this._timerId = GLib.timeout_add(
        GLib.PRIORITY_DEFAULT,
        intervalMs,
        () => {
            this._update();
            return GLib.SOURCE_CONTINUE;
        }
    );
}

_stopTimer() {
    if (this._timerId) {
        GLib.source_remove(this._timerId);
        this._timerId = null;
    }
}
```

Always clean up timers in `disable()` or `destroy()`.

---

## Performance Notes

This extension is optimized for minimal resource usage:

- **Update interval** defaults to 1 second; user can adjust 0.5-5s
- **Reentrancy guard** (`_isUpdating`) prevents concurrent executions
- **Efficient file reads** — `/proc/net/dev` is read once per update
- **Interface detection** — cached with periodic refresh (every 10 cycles)
- **GLib.timeout_add** — integrates with GNOME main loop, no busy-waiting
- **GObject signals** — properly disconnected on destroy to prevent leaks

Average CPU usage: <0.5% on modern hardware.

---

## Contributing

### Before Submitting Changes

1. **Ensure you're on the correct branch:**
   ```bash
   git switch modern/gnome-45-49
   ```

2. **Follow ESModules style:**
   - Use `import`/`export` syntax
   - Use `resource:///` URIs for GNOME Shell modules
   - Use `gi://` for GI modules
   - Keep modules small and focused

3. **Test on GNOME 45+** — verify no regressions

4. **Update version** if releasing

5. **Commit messages** — follow conventional commits:
   ```
   feat: add unit mode setting
   fix: handle null interface detection
   chore: update build script
   ```

6. **Push and PR:**
   ```bash
   git push origin your-branch
   # Open PR targeting modern/gnome-45-49
   ```

### Backporting to Legacy

If a fix should also support GNOME 42-44:

1. Implement in `modern/gnome-45-49` first
2. Switch to `legacy/gnome-42-44`
3. Adapt code to classic GJS syntax
4. Test on GNOME 42-44
5. Commit separately to legacy branch

Do not merge cross-branch without explicit review.

---

## License

**GNU General Public License v3.0** — see [LICENSE](../LICENSE) for details.

*Not affiliated with or endorsed by the GNOME Project. Community maintained.*

---

## Quick Reference

| Task | Command |
|------|---------|
| Switch to branch | `git switch modern/gnome-45-49` |
| Build package | `./scripts/build.sh` |
| Validate | `shexli dist/netspeed-plus-gnome45-<version>.shell-extension.zip` |
| Install locally | `cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/` |
| Enable | `gnome-extensions enable netspeedplus@sam.shell-extension` |
| View logs | `journalctl -f -o cat /usr/bin/gnome-shell` |
| Disable on crash | `gnome-extensions disable netspeedplus@sam.shell-extension` |

---

*Modern branch — actively maintained — Last updated: 2026-05-13*
