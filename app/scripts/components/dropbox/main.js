/**
 * @module components/dropbox/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Sync from './Sync';

export default function initialize() {
    const sync = Radio.request('collections/Configs', 'findConfig', {
        name: 'cloudStorage',
    });

    if (sync === 'dropbox') {
        return new Sync().init();
    }
}

Radio.once('App', 'start', initialize);
