import { spawnCommandSync, readFileSync, getMonotonicTime } from './utils.js';
import { IGNORED_INTERFACES, INTERFACE_CHECK_INTERVAL } from './constants.js';

export class NetworkMonitor {
    constructor() {
        this._activeInterface = null;
        this._interfaceCheckCounter = 0;
        this._prevRxBytes = 0;
        this._prevTxBytes = 0;
        this._prevTime = 0;
    }

    initialize() {
        const stats = this.readNetworkStats();
        this._prevRxBytes = stats.rx;
        this._prevTxBytes = stats.tx;
        this._prevTime = getMonotonicTime();
    }

    isIgnoredInterface(iface) {
        return IGNORED_INTERFACES.some(prefix => iface.startsWith(prefix));
    }

    detectActiveInterface() {
        const result = spawnCommandSync('ip route get 1');
        if (result.success && result.output) {
            const match = result.output.match(/dev\s+(\S+)/);
            if (match && match[1]) {
                const iface = match[1];
                if (!this.isIgnoredInterface(iface)) {
                    return iface;
                }
            }
        }
        return null;
    }

    readNetworkStats() {
        if (!this._activeInterface || this._interfaceCheckCounter >= INTERFACE_CHECK_INTERVAL) {
            const iface = this.detectActiveInterface();
            if (iface) {
                this._activeInterface = iface;
            }
            this._interfaceCheckCounter = 0;
        }
        this._interfaceCheckCounter++;

        if (!this._activeInterface) {
            return { rx: 0, tx: 0 };
        }

        const result = readFileSync('/proc/net/dev');
        if (!result.success) {
            return { rx: 0, tx: 0 };
        }

        const lines = result.contents.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith(this._activeInterface + ':')) {
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 10) {
                    const rxBytes = parseInt(parts[1], 10) || 0;
                    const txBytes = parseInt(parts[9], 10) || 0;
                    return { rx: rxBytes, tx: txBytes };
                }
            }
        }
        return { rx: 0, tx: 0 };
    }

    getSpeed() {
        const currentTime = getMonotonicTime();
        const stats = this.readNetworkStats();

        const timeDelta = (currentTime - this._prevTime) / 1000000;

        if (timeDelta <= 0 || timeDelta > 10) {
            this._prevRxBytes = stats.rx;
            this._prevTxBytes = stats.tx;
            this._prevTime = currentTime;
            return { rx: 0, tx: 0 };
        }

        let rxDelta = stats.rx - this._prevRxBytes;
        let txDelta = stats.tx - this._prevTxBytes;

        if (rxDelta < 0) rxDelta = stats.rx;
        if (txDelta < 0) txDelta = stats.tx;

        const rxSpeed = rxDelta / timeDelta;
        const txSpeed = txDelta / timeDelta;

        this._prevRxBytes = stats.rx;
        this._prevTxBytes = stats.tx;
        this._prevTime = currentTime;

        return { rx: rxSpeed, tx: txSpeed };
    }

    destroy() {
        this._activeInterface = null;
        this._prevRxBytes = 0;
        this._prevTxBytes = 0;
        this._prevTime = 0;
    }
}