/**
 * @module components/fuzzySearch/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import deb from 'debug';
import View from './views/View';

const log = deb('lav:components/fuzzySearch/Controller');

/**
 * Fuzzy search controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Search form channel.
     *
     * @prop {Object}
     */
    get formChannel() {
        return Radio.channel('components/navbar');
    }

    onDestroy() {
        Radio.request('Layout', 'empty', {region: 'fuzzySearch'});
        log('destroyed');
    }

    /**
     * Fetch notes, instantiae teh view, and start listening to events.
     *
     * @returns {Promise}
     */
    init() {
        this.wait = this.fetch()
        .then(collection => this.onFetch(collection))
        .catch(err => log('error', err));

        this.listenToEvents();

        return this.wait;
    }

    /**
     * Fetch all notes.
     *
     * @returns {Promise} notes collection
     */
    fetch() {
        log('fetching notes...');
        return Radio.request('collections/Notes', 'find');
    }

    /**
     * Instantiate the view.
     *
     * @param {Object} collection
     */
    onFetch(collection) {
        this.waitIsResolved = true;
        this.collection     = collection;
        this.view = new View({collection});

        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'childview:navigate:search', this.navigate);
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.formChannel, 'change:search', this.search);
        this.listenTo(this.formChannel, 'hidden:search', () => this.view.destroy());
    }

    /**
     * Search for notes.
     *
     * @param {Object} data
     * @param {String} data.query
     */
    search(data) {
        if (this.wait && !this.waitIsResolved) {
            return this.wait.then(() => this.search(data));
        }

        const models = this.collection.fuzzySearch(data.query);
        this.collection.reset(models);

        // Render the view if it isn't rendered yet
        if (!this.view.isRendered()) {
            Radio.request('Layout', 'show', {region: 'fuzzySearch', view: this.view});
        }
    }

    /**
     * Navigate to a note page.
     *
     * @param {Object} view - child view which triggered navigate:search event.
     */
    navigate(view) {
        const filterArgs = {
            filter : 'search',
            query  : encodeURIComponent(view.model.get('title')),
        };

        Radio.request('utils/Url', 'navigate', {filterArgs, id: view.model.id});
        this.view.destroy();
    }

}
