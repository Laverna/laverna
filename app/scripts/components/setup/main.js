/**
 * @module components/setup/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Controller from './Controller';

export default function initialize() {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:components',
        callback: () => new Controller().init(),
    });
}

Radio.once('App', 'init', initialize);
