/**
 * @module components/linkDialog/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Controller from './Controller';

export default function initialize() {
    const channel = Radio.channel('components/linkDialog');
    channel.reply('show', () => new Controller().init());
}

Radio.once('App', 'init', initialize);
