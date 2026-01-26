/* extension.js
 *
 * Net Speed Plus - GNOME Shell Extension
 * Display real-time network download and upload speed in the top panel
 *
 * Compatible with GNOME Shell 42-49 using classic GJS syntax
 */

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

// Unit mode constants
const UNIT_AUTO = 0;
const UNIT_KB = 1;
const UNIT_MB = 2;

// Interfaces to ignore (loopback, docker, virtual, etc.)
const IGNORED_INTERFACES = [
    'lo',       // Loopback
    'docker',   // Docker bridge
    'br-',      // Docker/bridge networks
    'veth',     // Virtual Ethernet (Docker containers)
    'virbr',    // Libvirt bridge
    'vmnet',    // VMware
    'vboxnet',  // VirtualBox
    'tun',      // VPN tunnel (only ignore inactive)
    'tap',      // TAP devices
];

/**
 * NetSpeedIndicator - Panel button that displays network speeds
 */
var NetSpeedIndicator = GObject.registerClass(
class NetSpeedIndicator extends PanelMenu.Button {
    /**
     * Initialize the indicator
     * @param {object} settings - The extension settings
     */
    _init(settings) {
        super._init(0.0, 'Net Speed Indicator', false);

        this._settings = settings;

        // Previous network stats for delta calculation
        this._prevRxBytes = 0;
        this._prevTxBytes = 0;
        this._prevTime = 0;

        // Timer source ID
        this._timerId = null;

        // Active interface cache
        this._activeInterface = null;
        this._interfaceCheckCounter = 0;

        // Update lock
        this._isUpdating = false;

        // Create the label for displaying speeds
        this._label = new St.Label({
            text: '—',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'netspeed-label',
        });

        this.add_child(this._label);

        // Connect to settings changes
        this._connectSettings();

        // Initialize with current stats
        this._initializeStats();

        // Start the update timer
        this._startTimer();
    }

    /**
     * Connect to GSettings change signals
     */
    _connectSettings() {
        this._settingConnections = [];

        this._settingConnections.push(
            this._settings.connect('changed::update-interval', () => this._restartTimer())
        );
        this._settingConnections.push(
            this._settings.connect('changed::show-download', () => this._updateDisplay())
        );
        this._settingConnections.push(
            this._settings.connect('changed::show-upload', () => this._updateDisplay())
        );
        this._settingConnections.push(
            this._settings.connect('changed::unit-mode', () => this._updateDisplay())
        );
    }

    /**
     * Disconnect all settings connections
     */
    _disconnectSettings() {
        if (this._settingConnections) {
            for (const id of this._settingConnections) {
                this._settings.disconnect(id);
            }
            this._settingConnections = null;
        }
    }

    /**
     * Detect the active network interface using `ip route get 1`
     * This reliably finds the interface used for internet traffic
     */
    _detectActiveInterface() {
        try {
            let [success, stdout, stderr, exitCode] = GLib.spawn_command_line_sync('ip route get 1');

            if (success && stdout) {
                let output = imports.byteArray.toString(stdout);
                // Parse output like: "1.0.0.0 via 192.168.1.1 dev eth0 src 192.168.1.100 uid 1000"
                let match = output.match(/dev\s+(\S+)/);
                if (match && match[1]) {
                    let iface = match[1];
                    // Validate it's not an ignored interface
                    if (!this._isIgnoredInterface(iface)) {
                        return iface;
                    }
                }
            }
        } catch (e) {
            log('NetSpeed: Error detecting active interface: ' + e.message);
        }
        return null;
    }

    /**
     * Check if an interface should be ignored
     *
     * @param {string} iface - Interface name to check
     * @returns {boolean} True if the interface should be ignored
     */
    _isIgnoredInterface(iface) {
        for (const prefix of IGNORED_INTERFACES) {
            if (iface.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Read network statistics from /proc/net/dev
     *
     * @returns {{rx: number, tx: number}} Received and transmitted bytes
     */
    _readNetworkStats() {
        // Re-detect interface periodically (every 10 updates) or if not set
        this._interfaceCheckCounter++;
        if (!this._activeInterface || this._interfaceCheckCounter >= 10) {
            let iface = this._detectActiveInterface();
            if (iface) {
                this._activeInterface = iface;
            }
            this._interfaceCheckCounter = 0;
        }

        if (!this._activeInterface) {
            return { rx: 0, tx: 0 };
        }

        try {
            let [success, contents] = GLib.file_get_contents('/proc/net/dev');

            if (!success) {
                return { rx: 0, tx: 0 };
            }

            let data = imports.byteArray.toString(contents);
            let lines = data.split('\n');

            for (const line of lines) {
                let trimmed = line.trim();

                // Check if this line is for our active interface
                if (trimmed.startsWith(this._activeInterface + ':')) {
                    // Parse the line: "iface: rx_bytes rx_packets ... tx_bytes tx_packets ..."
                    let parts = trimmed.split(/\s+/);

                    if (parts.length >= 10) {
                        // First part is "iface:", bytes are at index 1 (rx) and 9 (tx)
                        let rxBytes = parseInt(parts[1], 10) || 0;
                        let txBytes = parseInt(parts[9], 10) || 0;

                        return { rx: rxBytes, tx: txBytes };
                    }
                }
            }
        } catch (e) {
            log('NetSpeed: Error reading /proc/net/dev: ' + e.message);
        }
        return { rx: 0, tx: 0 };
    }

    /**
     * Initialize the previous stats for delta calculation
     */
    _initializeStats() {
        let stats = this._readNetworkStats();
        this._prevRxBytes = stats.rx;
        this._prevTxBytes = stats.tx;
        this._prevTime = GLib.get_monotonic_time();
    }

    /**
     * Format bytes per second to human-readable string
     *
     * @param {number} bytesPerSecond - Speed in bytes per second
     * @returns {string} Formatted speed string
     */
    _formatSpeed(bytesPerSecond) {
        let unitMode = this._settings.get_int('unit-mode');

        // Convert to KB/s
        let kbps = bytesPerSecond / 1024;

        if (unitMode === UNIT_KB) {
            // Always show KB/s
            return kbps.toFixed(1) + ' KB/s';
        } else if (unitMode === UNIT_MB) {
            // Always show MB/s
            let mbps = kbps / 1024;
            return mbps.toFixed(2) + ' MB/s';
        } else {
            // Auto mode: switch at 1000 KB/s threshold
            if (kbps >= 1000) {
                let mbps = kbps / 1024;
                return mbps.toFixed(2) + ' MB/s';
            } else {
                return kbps.toFixed(1) + ' KB/s';
            }
        }
    }

    /**
     * Calculate current speeds and update the display
     */
    _updateDisplay() {
        // Prevent concurrent updates
        if (this._isUpdating) {
            return;
        }
        this._isUpdating = true;

        try {
            let currentTime = GLib.get_monotonic_time();
            let stats = this._readNetworkStats();

            // Calculate time delta in seconds (monotonic time is in microseconds)
            let timeDelta = (currentTime - this._prevTime) / 1000000;

            // Avoid division by zero and unrealistic spikes
            if (timeDelta <= 0 || timeDelta > 10) {
                this._prevRxBytes = stats.rx;
                this._prevTxBytes = stats.tx;
                this._prevTime = currentTime;
                this._isUpdating = false;
                return;
            }

            // Calculate byte deltas (handle counter overflow)
            let rxDelta = stats.rx - this._prevRxBytes;
            let txDelta = stats.tx - this._prevTxBytes;

            // Handle counter reset/overflow
            if (rxDelta < 0) rxDelta = stats.rx;
            if (txDelta < 0) txDelta = stats.tx;

            // Calculate speeds in bytes per second
            let rxSpeed = rxDelta / timeDelta;
            let txSpeed = txDelta / timeDelta;

            // Store current values for next update
            this._prevRxBytes = stats.rx;
            this._prevTxBytes = stats.tx;
            this._prevTime = currentTime;

            // Build display text based on settings
            let showDownload = this._settings.get_boolean('show-download');
            let showUpload = this._settings.get_boolean('show-upload');

            let displayText = '';

            if (showDownload && showUpload) {
                displayText = '↓ ' + this._formatSpeed(rxSpeed) + '  ↑ ' + this._formatSpeed(txSpeed);
            } else if (showDownload) {
                displayText = '↓ ' + this._formatSpeed(rxSpeed);
            } else if (showUpload) {
                displayText = '↑ ' + this._formatSpeed(txSpeed);
            } else {
                // Both disabled - show placeholder
                displayText = '—';
            }

            this._label.set_text(displayText);
        } catch (e) {
            log('NetSpeed: Error updating display: ' + e.message);
        } finally {
            this._isUpdating = false;
        }
    }

    /**
     * Start the GLib timeout timer
     */
    _startTimer() {
        if (this._timerId) {
            return;
        }

        let interval = this._settings.get_double('update-interval');
        // Convert to milliseconds
        let intervalMs = Math.max(500, interval * 1000);

        this._timerId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            intervalMs,
            () => {
                this._updateDisplay();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    /**
     * Stop the GLib timeout timer
     */
    _stopTimer() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }

    /**
     * Restart the timer (called when interval setting changes)
     */
    _restartTimer() {
        this._stopTimer();
        this._startTimer();
    }

    /**
     * Clean up when the indicator is destroyed
     */
    destroy() {
        this._stopTimer();
        this._disconnectSettings();
        super.destroy();
    }
});

// Extension instance variables
let _indicator = null;
let _settings = null;

/**
 * Called when extension is loaded (not enabled)
 */
function init() {
    // Nothing to do here for this extension
}

/**
 * Called when extension is enabled
 */
function enable() {
    _settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.netspeed_plus');
    _indicator = new NetSpeedIndicator(_settings);
    // Add to the right side of the panel, before the system menu
    Main.panel.addToStatusArea('netspeed-indicator', _indicator, 0, 'right');
}

/**
 * Called when extension is disabled
 */
function disable() {
    if (_indicator) {
        _indicator.destroy();
        _indicator = null;
    }
    _settings = null;
}
