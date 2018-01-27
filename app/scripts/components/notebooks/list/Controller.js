/**
 * @module components/notebooks/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import deb from 'debug';

import View from './views/Layout';

const log = deb('lav:components/notebooks/list/Controller');

/**
 * Notebooks list controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * App configs.
     *
     * @returns {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    onDestroy() {
        this.view.options.notebooks.removeEvents();
        this.view.options.tags.removeEvents();
        log('destroyed');
    }

    /**
     * Fetch data and render the view.
     *
     * @returns {Promise}
     */
    init() {
        // Show a loader
        Radio.request('Layout', 'showLoader', {region: 'sidebar'});

        return this.fetch()
        .then(results => this.show(results[0], results[1]))
        .then(() => this.listenToEvents())
        .catch(err => log('error', err));
    }

    /**
     * Fetch all notebooks and tags.
     *
     * @returns {Promise}
     */
    fetch() {
        const opt = {conditions: {trash: 0}};
        return Promise.all([
            Radio.request('collections/Notebooks', 'find', opt),
            Radio.request('collections/Tags', 'find', opt),
        ]);
    }

    /**
     * Render the view.
     *
     * @param {Object} notebooks
     * @param {Object} tags
     */
    show(notebooks, tags) {
        this.view = new View({
            notebooks,
            tags,
            configs: this.configs,
        });

        Radio.request('Layout', 'empty', {region: 'content'});
        Radio.request('Layout', 'show', {region: 'sidebar', view: this.view});
        Radio.request('components/navbar', 'show', {section: _.i18n('Notebooks & tags')});
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        // Start listening to collection events
        this.view.options.notebooks.startListening();
        this.view.options.tags.startListening();

        // Show notebook form on "c" keybinding
        this.listenTo(Radio.channel('utils/Keybindings'), 'appCreateNote',
            this.onCreateKeybinding);

        // Show notebook form if add button in the navbar is clicked
        this.listenTo(Radio.channel('components/navbar'), 'show:form',
            this.navigateForm);

        // Destroy itself if the view is destroyed
        this.listenTo(this.view, 'destroy', this.destroy);
    }

    /**
     * Create keybinding is pressed.
     * Show notebook/tag form depending on what region is active at the moment.
     */
    onCreateKeybinding() {
        this.navigateForm({url: `/${this.view.activeRegion}/add`});
    }

    /**
     * Show notebook/tag form.
     *
     * @param {Object} data = {}
     * @param {String} (data.url) - URL that leads to the form page.
     * It will use notebook form if the parameter wasn't provided.
     */
    navigateForm(data = {}) {
        Radio.request('utils/Url', 'navigate', {url: data.url || '/notebooks/add'});
    }

}
