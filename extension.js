import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import St from 'resource:///org/gnome/shell/ui/st.js';
import Main from 'resource:///org/gnome/shell/ui/main.js';
import { NetSpeedIndicator } from './src/indicator.js';

export default class NetSpeedExtension extends Extension {
    enable() {
        this._indicator = new NetSpeedIndicator(this._settings);
        this._indicator.start();

        this._panelIndicator = new St.BoxLayout({
            style_class: 'netspeed-panel-item',
        });
        this._panelIndicator.add_child(this._indicator.getActor());

        Main.panel.addToStatusArea('netspeed-indicator', this._panelIndicator, 0, 'right');
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        if (this._panelIndicator) {
            this._panelIndicator.destroy();
            this._panelIndicator = null;
        }
    }
}