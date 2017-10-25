/**
 * @module components/dropbox/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Sync from './Sync';
import View from './settings/View';

export default function initialize() {
    const sync = Radio.request('collections/Configs', 'findConfig', {
        name: 'cloudStorage',
    });

    // Reply with the settings view
    Radio.channel('components/dropbox').reply({getSettingsView: () => View});

    if (sync === 'dropbox') {
        return new Sync().init();
    }
}

Radio.once('App', 'start', initialize);
