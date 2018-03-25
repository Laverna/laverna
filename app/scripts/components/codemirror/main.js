/**
 * @module components/codemirror/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';
import Controller from './Controller';

Radio.once('App', 'init', () => {
    Radio.on('components/notes/form', 'ready', opt => new Controller(opt).init());
});
