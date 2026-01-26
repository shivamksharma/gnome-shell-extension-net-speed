<h1 align="center">🌐 Net Speed Plus - GNOME Shell Extension</h1>

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
