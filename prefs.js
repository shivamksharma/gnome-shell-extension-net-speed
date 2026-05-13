import Gtk from 'gi://Gtk';
import { getSettings } from 'resource:///org/gnome/shell/extensions/extension.js';

export function buildPrefsWidget() {
    const settings = getSettings('org.gnome.shell.extensions.netspeed_plus');

    const widget = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin_top: 24,
        margin_bottom: 24,
        margin_start: 24,
        margin_end: 24,
        spacing: 18,
    });

    const displayFrameLabel = new Gtk.Label({
        label: '<b>Display Settings</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    const displayFrame = new Gtk.Frame({
        label_widget: displayFrameLabel,
    });

    const displayGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    const showDownloadLabel = new Gtk.Label({
        label: 'Show Download Speed (↓)',
        halign: Gtk.Align.START,
        hexpand: true,
    });
    const showDownloadSwitch = new Gtk.Switch({
        active: settings.get_boolean('show-download'),
        halign: Gtk.Align.END,
    });
    settings.bind('show-download', showDownloadSwitch, 'active', 0);
    displayGrid.attach(showDownloadLabel, 0, 0, 1, 1);
    displayGrid.attach(showDownloadSwitch, 1, 0, 1, 1);

    const showUploadLabel = new Gtk.Label({
        label: 'Show Upload Speed (↑)',
        halign: Gtk.Align.START,
        hexpand: true,
    });
    const showUploadSwitch = new Gtk.Switch({
        active: settings.get_boolean('show-upload'),
        halign: Gtk.Align.END,
    });
    settings.bind('show-upload', showUploadSwitch, 'active', 0);
    displayGrid.attach(showUploadLabel, 0, 1, 1, 1);
    displayGrid.attach(showUploadSwitch, 1, 1, 1, 1);

    displayFrame.set_child(displayGrid);

    const unitFrameLabel = new Gtk.Label({
        label: '<b>Unit Settings</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    const unitFrame = new Gtk.Frame({
        label_widget: unitFrameLabel,
    });

    const unitGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    const unitModeLabel = new Gtk.Label({
        label: 'Unit Display Mode',
        halign: Gtk.Align.START,
        hexpand: true,
    });

    const unitModeCombo = new Gtk.ComboBoxText({
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

    const intervalFrameLabel = new Gtk.Label({
        label: '<b>Update Interval</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    const intervalFrame = new Gtk.Frame({
        label_widget: intervalFrameLabel,
    });

    const intervalGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    const intervalLabel = new Gtk.Label({
        label: 'Refresh Rate',
        halign: Gtk.Align.START,
        hexpand: true,
    });

    const intervalCombo = new Gtk.ComboBoxText({
        halign: Gtk.Align.END,
    });
    intervalCombo.append('0.5', '0.5 seconds');
    intervalCombo.append('1', '1 second (default)');
    intervalCombo.append('2', '2 seconds');
    intervalCombo.append('5', '5 seconds');

    const currentInterval = settings.get_double('update-interval');
    intervalCombo.set_active_id(currentInterval.toString());

    intervalCombo.connect('changed', () => {
        settings.set_double('update-interval', parseFloat(intervalCombo.get_active_id()));
    });

    intervalGrid.attach(intervalLabel, 0, 0, 1, 1);
    intervalGrid.attach(intervalCombo, 1, 0, 1, 1);

    intervalFrame.set_child(intervalGrid);

    const aboutFrameLabel = new Gtk.Label({
        label: '<b>About</b>',
        use_markup: true,
        halign: Gtk.Align.START,
    });
    const aboutFrame = new Gtk.Frame({
        label_widget: aboutFrameLabel,
    });

    const aboutGrid = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 6,
        margin_top: 12,
        margin_bottom: 12,
        margin_start: 12,
        margin_end: 12,
    });

    const titleLabel = new Gtk.Label({
        label: '<span weight="bold" size="large">Net Speed Plus</span>',
        use_markup: true,
        halign: Gtk.Align.START,
    });

    const descLabel = new Gtk.Label({
        label: 'Real-time network speed indicator for GNOME Shell',
        halign: Gtk.Align.START,
    });

    const versionLabel = new Gtk.Label({
        label: 'Supports GNOME Shell 45-49',
        halign: Gtk.Align.START,
    });

    aboutGrid.attach(titleLabel, 0, 0, 1, 1);
    aboutGrid.attach(descLabel, 0, 1, 1, 1);
    aboutGrid.attach(versionLabel, 0, 2, 1, 1);

    aboutFrame.set_child(aboutGrid);

    widget.append(displayFrame);
    widget.append(unitFrame);
    widget.append(intervalFrame);
    widget.append(aboutFrame);

    return widget;
}