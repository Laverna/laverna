/**
 * @module components/settings/controller
 * @license MPL-2.0
 */
import deb from 'debug';
import Radio from 'backbone.radio';
import Sidebar from './sidebar/Controller';
import Show from './show/Controller';

const log = deb('lav:components/notes/controller');

export default {

    /**
     * Show settings sidebar.
     *
     * @param {Object} options
     */
    showSidebar(options) {
        // Instantiate the sidebar controller only once
        if (this.sidebar) {
            return;
        }

        this.sidebar = new Sidebar(options);
        this.sidebar.init();
        this.sidebar.once('destroy', () => this.onDestroy());
    },

    /**
     * Show settings.
     */
    showContent(tab) {
        log('showSettings', {tab});
        this.showSidebar({tab});

        this.content = new Show({tab});
        this.content.init();
        this.content.once('destroy', () => this.onDestroy());
    },

    /**
     * Destroy the sidebar controller if settings controller is destroyed.
     */
    onDestroy() {
        const url = Radio.request('utils/Url', 'getHash');

        // If a user is not on settings page anymore
        if (url.search('settings') === -1) {
            // Destroy the sidebar controller
            if (this.sidebar) {
                this.sidebar.destroy();
                this.sidebar = null;
            }

            // Destroy the content controller
            if (this.content) {
                this.content.destroy();
                this.content = null;
            }
        }
    },

};
