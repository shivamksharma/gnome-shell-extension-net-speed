export const UNIT_MODE = {
    AUTO: 0,
    KB: 1,
    MB: 2,
};

export const DEFAULT_UPDATE_INTERVAL = 1.0;
export const MIN_UPDATE_INTERVAL = 0.5;
export const MAX_UPDATE_INTERVAL = 10.0;

export const INTERFACE_CHECK_INTERVAL = 10;

export const IGNORED_INTERFACES = [
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

export const SETTINGS_KEYS = {
    UPDATE_INTERVAL: 'update-interval',
    UNIT_MODE: 'unit-mode',
    SHOW_DOWNLOAD: 'show-download',
    SHOW_UPLOAD: 'show-upload',
};