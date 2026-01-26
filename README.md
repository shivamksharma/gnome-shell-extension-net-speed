<p align="center">
  # 🌐 Net Speed Plus - GNOME Shell Extension
</p>

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

- **📊 Real-time Speed Monitoring** — Displays live download (↓) and upload (↑) speeds in the top panel
- **🔍 Smart Interface Detection** — Automatically detects your active network interface
- **⚙️ Highly Configurable** — Customize update intervals, units, and display options
- **🎯 Lightweight & Efficient** — Minimal resource usage
- **📱 Modern Preferences** — Clean GTK4 settings interface
- **🔄 Flexible Display** — Show download only, upload only, or both
- **📏 Adaptive Units** — Auto-switch between KB/s and MB/s
- **🚫 Smart Filtering** — Ignores virtual and internal interfaces

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

### From extensions.gnome.org (Recommended)

1. Visit [extensions.gnome.org](https://extensions.gnome.org)
2. Search for "Net Speed Plus"
3. Click the toggle to install and enable

### Manual Installation

1. Download from [GitHub](https://github.com/shivamksharma/gnome-shell-extension-net-speed)
2. Extract to `~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/`
3. Restart GNOME Shell (`Alt+F2`, type `r`, press Enter)
4. Enable via GNOME Extensions or GNOME Tweaks

### From Source

```bash
git clone https://github.com/shivamksharma/gnome-shell-extension-net-speed.git
cp -r gnome-shell-extension-net-speed ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
```

---

## ⚙️ Configuration

Access preferences through GNOME Extensions → Net Speed Plus → Settings

### Display Settings
- **Show Download Speed** — Toggle download display (↓)
- **Show Upload Speed** — Toggle upload display (↑)

### Unit Settings
- **Auto** — Switches between KB/s and MB/s automatically
- **KB/s only** — Always kilobytes per second
- **MB/s only** — Always megabytes per second

### Update Interval
- Choose refresh rate: 0.5s, 1s, 2s, or 5s

---

## 🔧 Technical Overview

Uses standard Linux networking APIs (`/proc/net/dev`, `ip route`) to monitor traffic. Automatically detects active interface and filters virtual networks (Docker, VPN, etc.).

---

## 📁 File Structure

```
netspeedplus@sam.shell-extension/
├── extension.js              # Main extension logic
├── metadata.json             # Extension metadata
├── prefs.js                  # Preferences UI
├── schemas/                  # GSettings schema
├── LICENSE                   # GPL-3.0 license
└── README.md                 # This file
```

---

## 🛠️ Development

### Prerequisites
- GNOME Shell 42+
- GJS and GTK4

### Testing
```bash
cp -r . ~/.local/share/gnome-shell/extensions/netspeedplus@sam.shell-extension/
glib-compile-schemas schemas/
gnome-extensions enable netspeedplus@sam.shell-extension
```

Debug with: `journalctl -f -o cat /usr/bin/gnome-shell`

---

## 🤝 Contributing

Contributions welcome! Please test on multiple GNOME versions and follow the GNOME Code of Conduct.

---

## 📄 License

**GNU General Public License v3.0** — see [LICENSE](LICENSE) for details.

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
