/**
 * @module components/settings/sidebar/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import View from './views/View';
import Navbar from './views/Navbar';
import deb from 'debug';

const log = deb('lav:components/settings/sidebar/Controller');

/**
 * Settings sidebar controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Radio channel.
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('components/settings');
    }

    /**
     * Destroy the views.
     */
    onDestroy() {
        this.stopListening();

        if (!this.view._isDestroyed) {
            this.view.destroy();
        }

        this.navbar.destroy();
    }

    init() {
        this.options.tab = this.options.tab || 'general';
        this.show();
        this.listenToEvents();
    }

    /**
     * Show the sidebar and navbar.
     */
    show() {
        // Render the sidebar view
        this.view = new View(this.options);
        Radio.request('Layout', 'show', {
            region : 'sidebar',
            view   : this.view,
        });

        // Render the navbar view
        this.navbar = new Navbar();
        Radio.request('Layout', 'show', {
            region : 'sidebarNavbar',
            view   : this.navbar,
        });
        log('show view');
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.channel, 'activate:tab', this.activateTab);
    }

    /**
     * Trigger activate:tab event to the view.
     *
     * @param {Object} data
     * @param {String} data.tab
     */
    activateTab(data) {
        this.view.activateTab(data);
    }

}
