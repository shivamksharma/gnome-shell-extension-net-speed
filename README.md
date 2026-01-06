# 🌐 Net Speed - GNOME Shell Extension

<p align="center">
  <strong>Real-time network speed indicator for your GNOME Shell top panel</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-42--49-4A86CF?style=flat-square&logo=gnome&logoColor=white" alt="GNOME 42-49">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0-green?style=flat-square" alt="Version">
</p>

---

## ✨ Features

- **📊 Real-time Speed Monitoring** — Displays live download (↓) and upload (↑) speeds directly in your top panel
- **🔍 Smart Interface Detection** — Automatically detects and monitors your active network interface
- **⚙️ Configurable Settings** — Customize update intervals, unit preferences, and display options
- **🎯 Lightweight & Efficient** — Minimal CPU and memory footprint
- **📱 GTK4 + Libadwaita** — Modern preferences UI following GNOME HIG

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Activities     ↓ 2.5 MB/s  ↑ 128.3 KB/s              🔋 🔊 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Compatibility

| GNOME Shell Version | Supported |
|:-------------------:|:---------:|
| 42                  | ✅        |
| 43                  | ✅        |
| 44                  | ✅        |
| 45                  | ✅        |
| 46                  | ✅        |
| 47                  | ✅        |
| 48                  | ✅        |
| 49                  | ✅        |

---

## 📥 Installation

### Method 1: Manual Installation

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/yourusername/netspeed-gnome-extension.git
   cd netspeed-gnome-extension
   ```

2. **Create the extension directory**:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/netspeed@nettu.local
   ```

3. **Copy extension files**:
   ```bash
   cp -r extension.js metadata.json prefs.js schemas ~/.local/share/gnome-shell/extensions/netspeed@nettu.local/
   ```

4. **Compile the GSettings schema**:
   ```bash
   cd ~/.local/share/gnome-shell/extensions/netspeed@nettu.local/schemas
   glib-compile-schemas .
   ```

5. **Restart GNOME Shell**:
   - On **X11**: Press `Alt+F2`, type `r`, and press Enter
   - On **Wayland**: Log out and log back in

6. **Enable the extension**:
   ```bash
   gnome-extensions enable netspeed@nettu.local
   ```

### Method 2: GNOME Extensions Website

Coming soon on [extensions.gnome.org](https://extensions.gnome.org)

---

## ⚙️ Configuration

Access the extension preferences through:
- **GNOME Extensions app** → Net Speed → Settings
- **Command line**: `gnome-extensions prefs netspeed@nettu.local`

### Display Settings

| Option | Description | Default |
|--------|-------------|---------|
| **Show Download Speed** | Display download speed (↓) in the panel | ✅ Enabled |
| **Show Upload Speed** | Display upload speed (↑) in the panel | ✅ Enabled |

### Unit Settings

| Mode | Description |
|------|-------------|
| **Auto** | Automatically switches between KB/s and MB/s (threshold: 1000 KB/s) |
| **KB/s only** | Always display speed in Kilobytes per second |
| **MB/s only** | Always display speed in Megabytes per second |

### Update Interval

| Interval | Use Case |
|----------|----------|
| **0.5 seconds** | High precision (higher CPU usage) |
| **1 second** | Balanced (default) |
| **2 seconds** | Battery-friendly |
| **5 seconds** | Minimal resource usage |

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
