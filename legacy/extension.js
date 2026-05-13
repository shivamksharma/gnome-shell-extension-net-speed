const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

const UNIT_AUTO = 0;
const UNIT_KB = 1;
const UNIT_MB = 2;

const IGNORED_INTERFACES = [
    'lo',
    'docker',
    'br-',
    'veth',
    'virbr',
    'vmnet',
    'vboxnet',
    'tun',
    'tap',
];

var NetSpeedIndicator = GObject.registerClass(
class NetSpeedIndicator extends PanelMenu.Button {
    _init(settings) {
        super._init(0.0, 'Net Speed Indicator', false);

        this._settings = settings;
        this._prevRxBytes = 0;
        this._prevTxBytes = 0;
        this._prevTime = 0;
        this._timerId = null;
        this._activeInterface = null;
        this._interfaceCheckCounter = 0;
        this._isUpdating = false;
        this._settingConnections = [];

        this._label = new St.Label({
            text: '—',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'netspeed-label',
        });

        this.add_child(this._label);

        this._connectSettings();
        this._initializeStats();
        this._startTimer();
    }

    _connectSettings() {
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

    _disconnectSettings() {
        if (this._settingConnections) {
            for (const id of this._settingConnections) {
                this._settings.disconnect(id);
            }
            this._settingConnections = [];
        }
    }

    _detectActiveInterface() {
        try {
            let [success, stdout, stderr] = GLib.spawn_command_line_sync('ip route get 1');

            if (success && stdout) {
                let output = imports.byteArray.toString(stdout);
                let match = output.match(/dev\s+(\S+)/);
                if (match && match[1]) {
                    let iface = match[1];
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

    _isIgnoredInterface(iface) {
        for (const prefix of IGNORED_INTERFACES) {
            if (iface.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    _readNetworkStats() {
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

                if (trimmed.startsWith(this._activeInterface + ':')) {
                    let parts = trimmed.split(/\s+/);

                    if (parts.length >= 10) {
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

    _initializeStats() {
        let stats = this._readNetworkStats();
        this._prevRxBytes = stats.rx;
        this._prevTxBytes = stats.tx;
        this._prevTime = GLib.get_monotonic_time();
    }

    _formatSpeed(bytesPerSecond) {
        let unitMode = this._settings.get_int('unit-mode');
        let kbps = bytesPerSecond / 1024;

        if (unitMode === UNIT_KB) {
            return kbps.toFixed(1) + ' KB/s';
        } else if (unitMode === UNIT_MB) {
            let mbps = kbps / 1024;
            return mbps.toFixed(2) + ' MB/s';
        } else {
            if (kbps >= 1000) {
                let mbps = kbps / 1024;
                return mbps.toFixed(2) + ' MB/s';
            } else {
                return kbps.toFixed(1) + ' KB/s';
            }
        }
    }

    _updateDisplay() {
        if (this._isUpdating) {
            return;
        }
        this._isUpdating = true;

        try {
            let currentTime = GLib.get_monotonic_time();
            let stats = this._readNetworkStats();

            let timeDelta = (currentTime - this._prevTime) / 1000000;

            if (timeDelta <= 0 || timeDelta > 10) {
                this._prevRxBytes = stats.rx;
                this._prevTxBytes = stats.tx;
                this._prevTime = currentTime;
                this._isUpdating = false;
                return;
            }

            let rxDelta = stats.rx - this._prevRxBytes;
            let txDelta = stats.tx - this._prevTxBytes;

            if (rxDelta < 0) rxDelta = stats.rx;
            if (txDelta < 0) txDelta = stats.tx;

            let rxSpeed = rxDelta / timeDelta;
            let txSpeed = txDelta / timeDelta;

            this._prevRxBytes = stats.rx;
            this._prevTxBytes = stats.tx;
            this._prevTime = currentTime;

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
                displayText = '—';
            }

            this._label.set_text(displayText);
        } catch (e) {
            log('NetSpeed: Error updating display: ' + e.message);
        } finally {
            this._isUpdating = false;
        }
    }

    _startTimer() {
        if (this._timerId) {
            return;
        }

        let interval = this._settings.get_double('update-interval');
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

    _stopTimer() {
        if (this._timerId) {
            GLib.source_remove(this._timerId);
            this._timerId = null;
        }
    }

    _restartTimer() {
        this._stopTimer();
        this._startTimer();
    }

    destroy() {
        this._stopTimer();
        this._disconnectSettings();
        super.destroy();
    }
});

let _indicator = null;
let _settings = null;

function init() {
}

function enable() {
    _settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.netspeed_plus');
    _indicator = new NetSpeedIndicator(_settings);
    Main.panel.addToStatusArea('netspeed-indicator', _indicator, 0, 'right');
}

function disable() {
    if (_indicator) {
        _indicator.destroy();
        _indicator = null;
    }
    _settings = null;
}