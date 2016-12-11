/**
 * @module components/help/main
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';

import About from './about/Controller';
import Keybindings from './keybindings/Controller';
import FirstStart from './firstStart/Controller';

let controller;
export default controller = {

    /**
     * @returns {Promise}
     */
    init() {
        Radio.reply('components/help', {
            showAbout       : this.showAbout,
            showFirstStart  : this.showFirstStart,
            showKeybindings : this.showKeybindings,
        }, this);

        // Show keybinding help if "?" key is pressed
        Radio.on('utils/Keybindings', 'appKeyboardHelp', () => this.showKeybindings());

        // Add a new initializer
        Radio.request('utils/Initializer', 'add', {
            name    : 'App:components',
            callback: () => this.showFirstStart(),
        });
    },

    /**
     * Show information about the app.
     */
    showAbout(...args) {
        return new About(...args).init();
    },

    /**
     * Show first start help/guide.
     *
     * @returns {Promise}
     */
    showFirstStart(...args) {
        return new FirstStart(...args).init();
    },

    /**
     * Shows keybinding help.
     */
    showKeybindings(...args) {
        return new Keybindings(...args).init();
    },

};

Radio.once('App', 'init', () => controller.init());
