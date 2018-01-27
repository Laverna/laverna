/**
 * @module components/setup/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Controller from './Controller';

export default function initialize() {
    // On "start" request show the "setup" form
    Radio.reply('components/setup', 'start', opt => new Controller(opt).init());

    // Add a new initializer to show the "setup" form on start
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:components',
        callback: () => new Controller().init(),
    });
}

Radio.once('App', 'init', initialize);
