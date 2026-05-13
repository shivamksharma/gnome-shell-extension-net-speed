import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { SETTINGS_KEYS } from './constants.js';
import { NetworkMonitor } from './networkMonitor.js';
import { formatSpeed, formatDisplayText } from './formatter.js';

export const NetSpeedIndicator = GObject.registerClass(
class NetSpeedIndicator extends GObject.Object {
    constructor(settings) {
        super();
        this._settings = settings;
        this._monitor = new NetworkMonitor();
        this._timerId = null;
        this._settingConnections = [];
        this._isUpdating = false;
        this._actor = null;
        this._label = null;
        this._container = null;
    }

    setupUI() {
        this._label = new St.Label({
            text: '—',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'netspeed-label',
        });

        this._container = new St.BoxLayout({
            style_class: 'netspeed-container',
        });
        this._container.add_child(this._label);
    }

    getActor() {
        if (!this._container) {
            this.setupUI();
        }
        return this._container;
    }

    start() {
        this._connectSettings();
        this._monitor.initialize();
        this._startTimer();
        this._updateDisplay();
    }

    _connectSettings() {
        this._settingConnections.push(
            this._settings.connect(`changed::${SETTINGS_KEYS.UPDATE_INTERVAL}`, () => this._restartTimer())
        );
        this._settingConnections.push(
            this._settings.connect(`changed::${SETTINGS_KEYS.SHOW_DOWNLOAD}`, () => this._updateDisplay())
        );
        this._settingConnections.push(
            this._settings.connect(`changed::${SETTINGS_KEYS.SHOW_UPLOAD}`, () => this._updateDisplay())
        );
        this._settingConnections.push(
            this._settings.connect(`changed::${SETTINGS_KEYS.UNIT_MODE}`, () => this._updateDisplay())
        );
    }

    _disconnectSettings() {
        for (const id of this._settingConnections) {
            this._settings.disconnect(id);
        }
        this._settingConnections = [];
    }

    _startTimer() {
        if (this._timerId) {
            return;
        }

        const interval = this._settings.get_double(SETTINGS_KEYS.UPDATE_INTERVAL);
        const intervalMs = Math.max(500, interval * 1000);

        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, intervalMs, () => {
            this._updateDisplay();
            return GLib.SOURCE_CONTINUE;
        });
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

    _updateDisplay() {
        if (this._isUpdating) {
            return;
        }
        this._isUpdating = true;

        try {
            const { rx, tx } = this._monitor.getSpeed();

            const showDownload = this._settings.get_boolean(SETTINGS_KEYS.SHOW_DOWNLOAD);
            const showUpload = this._settings.get_boolean(SETTINGS_KEYS.SHOW_UPLOAD);
            const unitMode = this._settings.get_int(SETTINGS_KEYS.UNIT_MODE);

            if (!showDownload && !showUpload) {
                this._label.set_text('—');
                this._isUpdating = false;
                return;
            }

            const displayText = formatDisplayText(rx, tx, showDownload, showUpload);
            this._label.set_text(displayText);
        } catch (e) {
            log(`NetSpeed: Error updating display: ${e.message}`);
        } finally {
            this._isUpdating = false;
        }
    }

    destroy() {
        this._stopTimer();
        this._disconnectSettings();
        if (this._monitor) {
            this._monitor.destroy();
            this._monitor = null;
        }
        if (this._container) {
            this._container.destroy();
            this._container = null;
        }
    }
});