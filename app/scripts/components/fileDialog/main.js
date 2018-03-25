/**
 * @module components/fileDialog/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Controller from './Controller';

export default function initialize() {
    const channel = Radio.channel('components/fileDialog');
    channel.reply('show', (...args) => new Controller(...args).init());
}

Radio.once('App', 'init', initialize);
