# 🌐 Net Speed Plus - GNOME Shell Extension

<p align="center">
  <strong>Real-time network speed indicator for your GNOME Shell top panel</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-42--49-4A86CF?style=flat-square&logo=gnome&logoColor=white" alt="GNOME 42-49">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Version-2.0-green?style=flat-square" alt="Version">
</p>

---

## ✨ Features

- **📊 Real-time Speed Monitoring** — Displays live download (↓) and upload (↑) speeds directly in your top panel
- **🔍 Smart Interface Detection** — Automatically detects and monitors your active network interface for internet traffic
- **⚙️ Highly Configurable** — Customize update intervals, unit preferences, and display options
- **🎯 Lightweight & Efficient** — Minimal CPU and memory footprint using standard Linux APIs
- **📱 Modern GTK4 Preferences** — Clean preferences UI following GNOME design guidelines
- **🔄 Flexible Display Modes** — Show download only, upload only, or both speeds
- **📏 Adaptive Units** — Auto-switch between KB/s and MB/s or force specific units
- **🚫 Smart Filtering** — Automatically ignores loopback, Docker, VPN, and virtual interfaces

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Activities     ↓ 2.5 MB/s  ↑ 128.3 KB/s              🔋 🔊 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Compatibility

| GNOME Shell Version |        Supported         |
| :-----------------: | :----------------------: |
|         42          |            ✅            |
|         43          |            ✅            |
|         44          |            ✅            |
|         45          |            ✅            |
|         46          |            ✅            |
|         47          |            ✅            |
|         48          |            ✅            |
|         49          |            ✅            |

---

## 📥 Installation

### Method 1: GNOME Extensions Website (Recommended)

The easiest way to install Net Speed Plus:

1. Visit [extensions.gnome.org](https://extensions.gnome.org)
2. Search for "Net Speed Plus"
3. Click the toggle to install and enable the extension
4. Configure settings through the extension preferences

### Method 2: Manual Installation

For manual installation or development:

1. **Download** the latest release from [GitHub](https://github.com/shivamksharma/gnome-shell-extension-net-speed)

2. **Extract** to the extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension
   unzip net-speed-plus.zip -d ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
   ```

3. **Compile schemas** (if not pre-compiled):
   ```bash
   cd ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/schemas
   glib-compile-schemas .
   ```

4. **Restart GNOME Shell**:
   - Press `Alt+F2`, type `r`, and press Enter

5. **Enable the extension**:
   ```bash
   gnome-extensions enable netspeedplus@sam.shell-extension
   ```

### Method 3: Installation from Source

```bash
git clone https://github.com/shivamksharma/gnome-shell-extension-net-speed.git
cd gnome-shell-extension-net-speed
cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
```

---

## ⚙️ Configuration

Access preferences through:

- **GNOME Extensions app** → Net Speed Plus → ⚙️ Settings icon
- **GNOME Tweaks** → Extensions → Net Speed Plus → Settings
- **Command line**: `gnome-extensions prefs netspeedplus@sam.shell-extension`

### Display Settings

| Option                  | Description                             | Default    |
| ----------------------- | --------------------------------------- | ---------- |
| **Show Download Speed** | Display download speed (↓) in the panel | ✅ Enabled |
| **Show Upload Speed**   | Display upload speed (↑) in the panel   | ✅ Enabled |

### Unit Settings

| Mode          | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| **Auto**      | Automatically switches between KB/s and MB/s (threshold: 1000 KB/s) |
| **KB/s only** | Always display speed in Kilobytes per second                        |
| **MB/s only** | Always display speed in Megabytes per second                        |

### Update Interval

| Interval        | Use Case                          | CPU Impact |
| --------------- | --------------------------------- | ---------- |
| **0.5 seconds** | High precision monitoring         | High       |
| **1 second**    | Balanced performance (recommended)| Medium     |
| **2 seconds**   | Power saving                      | Low        |
| **5 seconds**   | Minimal resource usage            | Very Low   |

---

## 🔧 Technical Details

### How It Works

1. **Interface Detection**: Uses `ip route get 1` to reliably identify the primary network interface for internet traffic
2. **Speed Calculation**: Reads byte counters from `/proc/net/dev` and calculates transfer rates over time intervals
3. **Smart Filtering**: Automatically excludes virtual and internal interfaces to show only real network activity

### Ignored Interfaces

The extension intelligently ignores these interface types:

- `lo` — Loopback interface
- `docker*` — Docker bridge networks
- `br-*` — Linux bridge interfaces
- `veth*` — Virtual Ethernet (containers)
- `virbr*` — Libvirt/KVM bridges
- `vmnet*` — VMware virtual networks
- `vboxnet*` — VirtualBox networks
- `tun*`, `tap*` — VPN tunnels and TAP devices

### Architecture

- **Language**: GJS (GNOME JavaScript) with GObject Introspection
- **UI Framework**: GTK4 for preferences
- **Data Sources**: Standard Linux `/proc/net/dev` and `ip route` commands
- **Settings**: GSettings with compiled schemas
- **Integration**: Native GNOME Shell panel API

---

## 📁 File Structure

```
netspeedplus@sam.shell-extension/
├── extension.js              # Main extension logic and panel indicator
├── metadata.json             # Extension metadata and GNOME version support
├── prefs.js                  # GTK4 preferences interface
├── schemas/
│   ├── gschemas.compiled     # Compiled GSettings binary
│   └── org.gnome.shell.extensions.netspeed_plus.gschema.xml  # Settings schema
├── LICENSE                   # GNU GPL-3.0 license
└── README.md                 # This documentation
```

---

## 🛠️ Development

### Prerequisites

- GNOME Shell 42+
- GJS (GNOME JavaScript runtime)
- GTK4 development libraries
- `glib-compile-schemas` (usually from glib2-devel)

### Building & Testing

1. **Install for development**:
   ```bash
   cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
   cd ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
   glib-compile-schemas schemas/
   ```

2. **Enable extension**:
   ```bash
   gnome-extensions enable netspeedplus@sam.shell-extension
   ```

3. **Debug logging**:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell
   ```

4. **Restart Shell** for code changes:
   ```bash
   # Alt+F2 → r (X11)
   # Or logout/login (Wayland)
   ```

### Code Style

- Classic GJS syntax compatible with GNOME Shell 42+
- GObject-based classes with proper inheritance
- Comprehensive error handling and logging
- Follows GNOME Shell extension best practices

### Common Issues

- **No speeds displayed**: Check if active interface is detected (`ip route get 1`)
- **Wrong interface**: Extension may be monitoring a virtual interface
- **Extension not loading**: Verify GNOME Shell version compatibility
- **Settings not saving**: Check GSettings schema compilation

---

## 🤝 Contributing

We welcome contributions! Please:

1. **Follow GNOME Code of Conduct**
2. **Test on multiple GNOME versions** (42-49)
3. **Use conventional commits** for PRs
4. **Document new features** in code and README

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/gnome-shell-extension-net-speed.git
cd gnome-shell-extension-net-speed

# Install for testing
cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/

# Make changes, test, submit PR
```

---

## 📝 Changelog

### v2.0.0 (Current)

- ✅ Extended support to GNOME Shell 42-49
- ✅ Improved interface detection reliability
- ✅ Enhanced error handling and logging
- ✅ Updated GTK4 preferences UI
- ✅ Better virtual interface filtering
- ✅ Performance optimizations

### v1.0.0 (Initial Release)

- ✅ Real-time network speed display
- ✅ Automatic interface detection
- ✅ Configurable settings
- ✅ GTK4 preferences interface
- ✅ GNOME Shell 42-44 support

---

## 📄 License

**GNU General Public License v3.0**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See [LICENSE](LICENSE) for the full license text.

---

## 🙏 Support

- **Report Issues**: [GitHub Issues](https://github.com/shivamksharma/gnome-shell-extension-net-speed/issues)
- **Donate**: [Buy Me a Coffee](https://www.buymeacoffee.com/shivamksharma)

*Not affiliated with or endorsed by the GNOME Project. Community maintained.*
## ⚙️ Configuration

Access the extension preferences through:

- **GNOME Extensions app** → Net Speed → Settings
- **Command line**: `gnome-extensions prefs netspeed@nettu.local`

### Display Settings

| Option                  | Description                             | Default    |
| ----------------------- | --------------------------------------- | ---------- |
| **Show Download Speed** | Display download speed (↓) in the panel | ✅ Enabled |
| **Show Upload Speed**   | Display upload speed (↑) in the panel   | ✅ Enabled |

### Unit Settings

| Mode          | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| **Auto**      | Automatically switches between KB/s and MB/s (threshold: 1000 KB/s) |
| **KB/s only** | Always display speed in Kilobytes per second                        |
| **MB/s only** | Always display speed in Megabytes per second                        |

### Update Interval

| Interval        | Use Case                          |
| --------------- | --------------------------------- |
| **0.5 seconds** | High precision (higher CPU usage) |
| **1 second**    | Balanced (default)                |
| **2 seconds**   | Battery-friendly                  |
| **5 seconds**   | Minimal resource usage            |

---

## 🔧 Technical Details

### How It Works

1. **Interface Detection**: Uses `ip route get 1` to identify the primary network interface carrying internet traffic
2. **Speed Calculation**: Reads byte counters from `/proc/net/dev` and calculates the delta between updates
3. **Filtering**: Ignores virtual and internal interfaces (loopback, Docker, VPN tunnels, VirtualBox, etc.)

### Ignored Interfaces

The extension automatically ignores:

- `lo` — Loopback
- `docker*` — Docker bridge networks
- `br-*` — Bridge networks
- `veth*` — Virtual Ethernet (containers)
- `virbr*` — Libvirt bridges
- `vmnet*` — VMware networks
- `vboxnet*` — VirtualBox networks
- `tun*`, `tap*` — VPN tunnels

### File Structure

```
netspeed@nettu.local/
├── extension.js          # Main extension logic
├── metadata.json         # Extension metadata
├── prefs.js              # GTK4 preferences UI
├── schemas/
│   ├── org.gnome.shell.extensions.netspeed.gschema.xml
│   └── gschemas.compiled
└── README.md
```

---

## 🛠️ Development

### Prerequisites

- GNOME Shell 42+
- GJS (GNOME JavaScript)
- GTK4 + Libadwaita
- `glib-compile-schemas` (from `glib2-devel` or similar package)

### Building Schemas

```bash
cd schemas/
glib-compile-schemas .
```

### Debugging

View extension logs in real-time:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

Enable looking glass for debugging:

- Press `Alt+F2` and type `lg` (X11 only)

### Testing Changes

1. Make your changes to the source files
2. Restart GNOME Shell (X11: `Alt+F2` → `r`) or re-log (Wayland)
3. Check logs for errors

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `style:` — Code style changes
- `refactor:` — Code refactoring
- `perf:` — Performance improvements

---

## 📝 Changelog

### v1.0.0 (Initial Release)

- ✅ Real-time download and upload speed display
- ✅ Automatic active interface detection
- ✅ Configurable update interval (0.5s - 5s)
- ✅ Unit mode selection (Auto/KB/MB)
- ✅ Toggle download/upload visibility
- ✅ GTK4 + Libadwaita preferences UI
- ✅ Support for GNOME Shell 42-49

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Support

- **Report Issues**: [GitHub Issues](https://github.com/shivamksharma/gnome-shell-extension-net-speed/issues)
- **Donate**: [Buy Me a Coffee](https://www.buymeacoffee.com/shivamksharma)

*Not affiliated with or endorsed by the GNOME Project. Community maintained.*
