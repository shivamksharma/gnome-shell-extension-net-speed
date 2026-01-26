/* prefs.js
 *
 * Net Speed Plus - GNOME Shell Extension Preferences
 * Compatible with GNOME Shell 42-49 using classic GJS syntax
 */

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;

/**
 * Called when preferences are loaded (GNOME 42-44)
 */
function init() {
    // Nothing to initialize here
}

/**
 * Build the preferences widget (GNOME 42-44 compatible)
 * @returns {Gtk.Widget} The preferences widget
 */
function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.netspeed_plus');

    // GNOME 42+ uses GTK4 for preferences
    // Create the main box
    let mainBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin_top: 24,
        margin_bottom: 24,
        margin_start: 24,
        margin_end: 24,
        spacing: 18,
    });

    // =========================================================================
    // Display Settings Frame
    // =========================================================================
    let displayFrameLabel = new Gtk.Label({
        label: '<b>Display Settings</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    let displayFrame = new Gtk.Frame({
        label_widget: displayFrameLabel,
    });

    let displayGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    // Show Download toggle
    let showDownloadLabel = new Gtk.Label({
        label: 'Show Download Speed (↓)',
        halign: Gtk.Align.START,
        hexpand: true,
    });
    let showDownloadSwitch = new Gtk.Switch({
        active: settings.get_boolean('show-download'),
        halign: Gtk.Align.END,
    });
    settings.bind('show-download', showDownloadSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
    displayGrid.attach(showDownloadLabel, 0, 0, 1, 1);
    displayGrid.attach(showDownloadSwitch, 1, 0, 1, 1);

    // Show Upload toggle
    let showUploadLabel = new Gtk.Label({
        label: 'Show Upload Speed (↑)',
        halign: Gtk.Align.START,
        hexpand: true,
    });
    let showUploadSwitch = new Gtk.Switch({
        active: settings.get_boolean('show-upload'),
        halign: Gtk.Align.END,
    });
    settings.bind('show-upload', showUploadSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
    displayGrid.attach(showUploadLabel, 0, 1, 1, 1);
    displayGrid.attach(showUploadSwitch, 1, 1, 1, 1);

    displayFrame.set_child(displayGrid);

    // =========================================================================
    // Unit Settings Frame
    // =========================================================================
    let unitFrameLabel = new Gtk.Label({
        label: '<b>Unit Settings</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    let unitFrame = new Gtk.Frame({
        label_widget: unitFrameLabel,
    });

    let unitGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    let unitModeLabel = new Gtk.Label({
        label: 'Unit Display Mode',
        halign: Gtk.Align.START,
        hexpand: true,
    });

    let unitModeCombo = new Gtk.ComboBoxText({
        halign: Gtk.Align.END,
    });
    unitModeCombo.append('0', 'Auto (KB/s ↔ MB/s)');
    unitModeCombo.append('1', 'KB/s only');
    unitModeCombo.append('2', 'MB/s only');
    unitModeCombo.set_active_id(settings.get_int('unit-mode').toString());

    unitModeCombo.connect('changed', () => {
        settings.set_int('unit-mode', parseInt(unitModeCombo.get_active_id()));
    });

    unitGrid.attach(unitModeLabel, 0, 0, 1, 1);
    unitGrid.attach(unitModeCombo, 1, 0, 1, 1);

    unitFrame.set_child(unitGrid);

    // =========================================================================
    // Update Interval Frame
    // =========================================================================
    let intervalFrameLabel = new Gtk.Label({
        label: '<b>Update Interval</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    let intervalFrame = new Gtk.Frame({
        label_widget: intervalFrameLabel,
    });

    let intervalGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    let intervalLabel = new Gtk.Label({
        label: 'Refresh Rate',
        halign: Gtk.Align.START,
        hexpand: true,
    });

    let intervalCombo = new Gtk.ComboBoxText({
        halign: Gtk.Align.END,
    });
    intervalCombo.append('0.5', '0.5 seconds');
    intervalCombo.append('1', '1 second (default)');
    intervalCombo.append('2', '2 seconds');
    intervalCombo.append('5', '5 seconds');

    let currentInterval = settings.get_double('update-interval');
    intervalCombo.set_active_id(currentInterval.toString());

    intervalCombo.connect('changed', () => {
        settings.set_double('update-interval', parseFloat(intervalCombo.get_active_id()));
    });

    intervalGrid.attach(intervalLabel, 0, 0, 1, 1);
    intervalGrid.attach(intervalCombo, 1, 0, 1, 1);

    intervalFrame.set_child(intervalGrid);

    // =========================================================================
    // About Frame
    // =========================================================================
    let aboutFrameLabel = new Gtk.Label({
        label: '<b>About</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    let aboutFrame = new Gtk.Frame({
        label_widget: aboutFrameLabel,
    });

    let aboutGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 6,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    let titleLabel = new Gtk.Label({
        label: '<span weight="bold" size="large">Net Speed Plus</span>',
        use_markup: true,
        halign: Gtk.Align.START,
    });

    let descLabel = new Gtk.Label({
        label: 'Real-time network speed indicator for GNOME Shell',
        halign: Gtk.Align.START,
    });

    let versionLabel = new Gtk.Label({
        label: 'Supports GNOME Shell 42-49',
        halign: Gtk.Align.START,
    });

    aboutGrid.attach(titleLabel, 0, 0, 1, 1);
    aboutGrid.attach(descLabel, 0, 1, 1, 1);
    aboutGrid.attach(versionLabel, 0, 2, 1, 1);

    aboutFrame.set_child(aboutGrid);

    // Add all frames to main box (GTK4 uses append)
    mainBox.append(displayFrame);
    mainBox.append(unitFrame);
    mainBox.append(intervalFrame);
    mainBox.append(aboutFrame);

    return mainBox;
}
