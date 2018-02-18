/**
 * @module components/notes/list/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';

import View from './views/Layout';

const log = deb('lav:components/notes/list/Controller');

/**
 * Notes list controller.
 *
 * @class
 * @extends Marionette.Controller
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Application configs.
     *
     * @returns {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * Fetch notes collection and render the sidebar view.
     *
     * @param {Object} options
     * @returns {Promise}
     */
    async init() {
        const opt = _.extend({}, this.options.filterArgs, {
            perPage: this.configs.pagination,
        });

        // Show a loader
        Radio.request('Layout', 'showLoader', {region: 'sidebar'});

        // Fetch notes
        try {
            const collection = await Radio.request('collections/Notes', 'find', opt);
            this.show(collection);
            this.listenToEvents();
        }
        catch (e) {
            log('Error', e);
        }
    }

    onDestroy() {
        log('destroy the controller');
        this.view.collection.removeEvents();
    }

    /**
     * Render the view.
     *
     * @fires components/notes#show:sidebar
     * @param {Object} collection
     */
    show(collection) {
        this.view = new View(_.extend({
            collection,
            configs : this.configs,
        }, this.options));

        Radio.request('Layout', 'show', {region: 'sidebar', view: this.view});
        Radio.request('components/navbar', 'show', this.options.filterArgs);
    }

    /**
     * Listen to various events.
     */
    listenToEvents() {
        this.view.collection.startListening();

        // Show note form on "c" keybinding
        this.listenTo(Radio.channel('utils/Keybindings'), 'appCreateNote',
            this.navigateForm);

        // Show note form if add buttons in the navbar is clicked
        this.listenTo(Radio.channel('components/navbar'), 'show:form',
            this.navigateForm);

        // Open a note on model:navigate event
        this.listenTo(this.view.collection.channel, 'model:navigate',
            _.debounce(this.navigateModel, 420));

        // Destroy itself if the view is destroyed
        this.listenTo(this.view, 'destroy', this.destroy);
    }

    /**
     * Open a particular note.
     *
     * @param {Object} data
     * @param {Object} data.model - Backbone model
     */
    navigateModel(data) {
        const {model} = data;

        /**
         * Before navigating to a note, change URI.
         * It is done because if a user navigates back to the same page
         * a note might not appear at all.
         */
        Radio.request('utils/Url', 'navigate', {
            trigger    : false,
            filterArgs : this.options.filterArgs,
        });

        // Navigate to the note page
        Radio.request('utils/Url', 'navigate', {
            model,
            filterArgs : this.options.filterArgs,
        });
    }

    /**
     * Show note form.
     */
    navigateForm() {
        log('navigate to form');
        Radio.request('utils/Url', 'navigate', {url: 'notes/add'});
    }

}
