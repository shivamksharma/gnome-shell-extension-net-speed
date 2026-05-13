import GLib from 'gi://GLib';

export function spawnCommandSync(command) {
    try {
        const [success, stdout, stderr, exitStatus] = GLib.spawnCommandLineSync(command);
        if (success && stdout) {
            const decoder = new TextDecoder('utf-8');
            return { success: true, output: decoder.decode(stdout), error: decoder.decode(stderr) };
        }
        return { success: false, output: '', error: 'Command failed' };
    } catch (e) {
        return { success: false, output: '', error: e.message };
    }
}

export function readFileSync(path) {
    try {
        const [success, contents] = GLib.file_get_contents(path);
        if (success && contents) {
            const decoder = new TextDecoder('utf-8');
            return { success: true, contents: decoder.decode(contents) };
        }
        return { success: false, contents: '' };
    } catch (e) {
        return { success: false, contents: '' };
    }
}

export function getMonotonicTime() {
    return GLib.get_monotonic_time();
}

export function getMonotonicTimeSeconds() {
    return GLib.get_monotonic_time() / 1000000;
}