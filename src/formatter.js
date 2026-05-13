import { UNIT_MODE } from './constants.js';

export function formatSpeed(bytesPerSecond, unitMode) {
    const kbps = bytesPerSecond / 1024;

    switch (unitMode) {
        case UNIT_MODE.KB:
            return kbps.toFixed(1) + ' KB/s';
        case UNIT_MODE.MB:
            const mbps = kbps / 1024;
            return mbps.toFixed(2) + ' MB/s';
        case UNIT_MODE.AUTO:
        default:
            if (kbps >= 1000) {
                const mb = kbps / 1024;
                return mb.toFixed(2) + ' MB/s';
            }
            return kbps.toFixed(1) + ' KB/s';
    }
}

export function formatDisplayText(rxSpeed, txSpeed, showDownload, showUpload) {
    if (showDownload && showUpload) {
        return `↓ ${formatSpeed(rxSpeed, 0)}  ↑ ${formatSpeed(txSpeed, 0)}`;
    } else if (showDownload) {
        return `↓ ${formatSpeed(rxSpeed, 0)}`;
    } else if (showUpload) {
        return `↑ ${formatSpeed(txSpeed, 0)}`;
    }
    return '—';
}