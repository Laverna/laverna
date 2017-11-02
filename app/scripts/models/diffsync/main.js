/**
 * @module models/diffsync/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Signal from '../Signal';
import Peer from '../Peer';
import Core from './Core';

export default function initializer() {
    const sync = Radio.request('collections/Configs', 'findConfig', {
        name: 'cloudStorage',
    });

    if (sync === 'p2p' || sync === '0') {
        // Initialize peer class and differential synchronization core
        Radio.once('App', 'start', () => {
            new Peer().init();
            new Core().init();
        });

        // Instantiate the class that connects a user to the signaling server
        return new Signal();
    }
}

// Add a new initializer
Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:utils',
        callback: initializer,
    });
});
