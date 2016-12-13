/**
 * @module components/settings/controller
 * @license MPL-2.0
 */
import deb from 'debug';
import Sidebar from './sidebar/Controller';

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
    },

    /**
     * Show settings.
     */
    showContent(profileId, tab) {
        this.showSidebar({profileId, tab});
        log('show settings', {profileId, tab});
    },

    /**
     * Destroy the sidebar controller if settings controller is destroyed.
     */
    onContentDestroy() {
        const url = Radio.request('utils/Url', 'getHash');

        if (url.search('settings') === -1) {
            this.sidebar.destroy();
            this.sidebar = null;
        }
    }

};
