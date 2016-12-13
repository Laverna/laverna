/**
 * @module components/electronSearch/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Electron search view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    get className() {
        return 'electron--search';
    }

    ui() {
        return {
            search: '[name="text"]',
        };
    }

    events() {
        return {
            'input @ui.search'     : 'onInput',
            'submit form'          : 'next',
            'click #search--next'  : 'next',
            'click #search--prev'  : 'previous',

            'keyup @ui.search'     : 'destroyOnEsc',
            'click .search--close' : 'destroy',
        };
    }

    constructor(...args) {
        super(...args);

        /**
         * electron.remote
         *
         * @prop {Object}
         */
        this.remote = window.requireNode('electron').remote;
    }

    onReady() {
        this.ui.search.focus();
    }

    /**
     * Clear search highlights.
     */
    onDestroy() {
        this.remote.getCurrentWindow().webContents.stopFindInPage('clearSelection');
    }

    /**
     * If the search input value is changed, try to find the keyword on the page.
     */
    onInput() {
        this.search();

        // Prevent it from losing focus
        this.remote.getCurrentWindow().webContents.once(
            'found-in-page',
            () => this.onFind()
        );

        // Return true to allow change
        return true;
    }

    /**
     * Focus on search input.
     */
    onFind() {
        this.ui.search.focus();
    }

    /**
     * Search a keyword on the page.
     *
     * @param {Boolean} backSearch - true if it's a backward search
     */
    search(backSearch) {
        const text = this.ui.search.val().trim();
        if (!text.length) {
            return;
        }

        const webContents = this.remote.getCurrentWindow().webContents;
        if (backSearch) {
            return webContents.findInPage(text, {forward: false});
        }

        return webContents.findInPage(text);
    }

    /**
     * Find the next occurence on the page.
     *
     * @returns {Boolean} - false
     */
    next() {
        this.search();
        return false;
    }

    /**
     * Find the previous occurence on the page.
     *
     * @returns {Boolean} false
     */
    previous() {
        this.search(true);
        return false;
    }

    /**
     * Destroy itself if Escape key is pressed.
     *
     * @param {Object} e
     */
    destroyOnEsc(e) {
        if (e.keyCode === 27) {
            this.destroy();
        }
    }

}
