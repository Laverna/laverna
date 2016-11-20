/**
 * @module components/help/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';

import About from './about/Controller';

let controller;
export default controller = {

    init() {
        Radio.reply('components/help', {
            showAbout       : this.showAbout,
            showFirstStart  : this.showFirstStart,
            showKeybindings : this.showKeybindings,
        }, this);
    },

    /**
     * Show information about the app.
     */
    showAbout(...args) {
        return new About(...args).init();
    },

    showFirstStart() {
    },

    /**
     * Shows keybinding help.
     */
    showKeybindings() {
    },

};

Radio.once('App', 'init', () => controller.init());
