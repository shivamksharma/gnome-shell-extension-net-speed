import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class NetSpeedPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create a preferences page
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        // =========================================================================
        // Display Settings Group
        // =========================================================================
        const displayGroup = new Adw.PreferencesGroup({
            title: 'Display Settings',
            description: 'Configure what speeds to show in the panel',
        });
        page.add(displayGroup);

        // Show Download toggle
        const showDownloadRow = new Adw.ActionRow({
            title: 'Show Download Speed',
            subtitle: 'Display download speed (↓) in the panel',
        });
        const showDownloadSwitch = new Gtk.Switch({
            active: settings.get_boolean('show-download'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind(
            'show-download',
            showDownloadSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        showDownloadRow.add_suffix(showDownloadSwitch);
        showDownloadRow.activatable_widget = showDownloadSwitch;
        displayGroup.add(showDownloadRow);

        // Show Upload toggle
        const showUploadRow = new Adw.ActionRow({
            title: 'Show Upload Speed',
            subtitle: 'Display upload speed (↑) in the panel',
        });
        const showUploadSwitch = new Gtk.Switch({
            active: settings.get_boolean('show-upload'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind(
            'show-upload',
            showUploadSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        showUploadRow.add_suffix(showUploadSwitch);
        showUploadRow.activatable_widget = showUploadSwitch;
        displayGroup.add(showUploadRow);

        // =========================================================================
        // Unit Settings Group
        // =========================================================================
        const unitGroup = new Adw.PreferencesGroup({
            title: 'Unit Settings',
            description: 'Configure how speed units are displayed',
        });
        page.add(unitGroup);

        // Unit mode dropdown
        const unitModeRow = new Adw.ActionRow({
            title: 'Unit Display Mode',
            subtitle: 'Choose how speed units are formatted',
        });

        const unitModeCombo = new Gtk.ComboBoxText({
            valign: Gtk.Align.CENTER,
        });
        unitModeCombo.append('0', 'Auto (KB/s ↔ MB/s)');
        unitModeCombo.append('1', 'KB/s only');
        unitModeCombo.append('2', 'MB/s only');
        unitModeCombo.set_active_id(settings.get_int('unit-mode').toString());

        unitModeCombo.connect('changed', () => {
            settings.set_int('unit-mode', parseInt(unitModeCombo.get_active_id()));
        });

        unitModeRow.add_suffix(unitModeCombo);
        unitGroup.add(unitModeRow);

        // =========================================================================
        // Update Interval Group
        // =========================================================================
        const intervalGroup = new Adw.PreferencesGroup({
            title: 'Update Interval',
            description: 'Configure how often the speed is updated',
        });
        page.add(intervalGroup);

        // Update interval dropdown
        const intervalRow = new Adw.ActionRow({
            title: 'Refresh Rate',
            subtitle: 'Faster updates use more CPU and battery',
        });

        const intervalCombo = new Gtk.ComboBoxText({
            valign: Gtk.Align.CENTER,
        });
        intervalCombo.append('0.5', '0.5 seconds');
        intervalCombo.append('1', '1 second (default)');
        intervalCombo.append('2', '2 seconds');
        intervalCombo.append('5', '5 seconds');

        // Set initial value
        const currentInterval = settings.get_double('update-interval');
        intervalCombo.set_active_id(currentInterval.toString());

        intervalCombo.connect('changed', () => {
            settings.set_double('update-interval', parseFloat(intervalCombo.get_active_id()));
        });

        intervalRow.add_suffix(intervalCombo);
        intervalGroup.add(intervalRow);

        // =========================================================================
        // About Group
        // =========================================================================
        const aboutGroup = new Adw.PreferencesGroup({
            title: 'About',
        });
        page.add(aboutGroup);

        const aboutRow = new Adw.ActionRow({
            title: 'Net Speed Plus', // Updated title
            subtitle: 'Real-time network speed indicator for GNOME Shell',
        });
        aboutGroup.add(aboutRow);

        // Set minimum window size
        window.set_default_size(450, 500);
    }
}
