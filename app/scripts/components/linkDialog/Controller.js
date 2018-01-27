/**
 * @module components/linkDialog/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import View from './views/View';
import deb from 'debug';

const log = deb('lav:components/linkDialog/Controller');

/**
 * Link dialog controller.
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
        return Radio.channel('components/linkDialog');
    }

    /**
     * Notes collection channel.
     *
     * @prop {Object}
     */
    get notesChannel() {
        return Radio.channel('collections/Notes');
    }

    onDestroy() {
        log('destroyed');

        if (this.promise) {
            this.promise.resolve(null);
            this.promise = null;
        }
    }

    /**
     * Initialize a new link dialog.
     *
     * @returns {Promise} - resolves with the URL
     */
    init() {
        return new Promise((resolve, reject) => {
            this.promise = {resolve, reject};
            this.show();
            this.listenToEvents();
        });
    }

    /**
     * Render the view.
     */
    show() {
        this.view = new View();
        Radio.request('Layout', 'show', {region: 'modal', view: this.view});
        this.wait = this.renderDropdown();
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        // Destroy itself if the view is destroyed
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'cancel', () => this.view.destroy());

        this.listenTo(this.view, 'save', this.resolve);
        this.listenTo(this.view, 'search', this.search);
        this.listenTo(this.view, 'create:note', this.createNote);
    }

    /**
     * Show a dropdown menu with notes.
     *
     * @returns {Promise}
     */
    renderDropdown() {
        return this.notesChannel.request('find', {pageSize: 10})
        .then(collection => {
            this.view.options.collection = collection;
            this.view.renderDropdown();
        })
        .catch(err => log('error', err));
    }

    /**
     * Resolve the promise.
     *
     * @param {String} [url]
     */
    resolve(url) {
        const urlResolve = _.isString(url) ? url : this.view.ui.url.val().trim();
        this.promise.resolve(urlResolve);
        this.promise = null;
        this.view.destroy();
    }

    /**
     * Search for a note.
     *
     * @param {Object} data
     * @param {String} data.text
     */
    search(data) {
        // Wait until the notes collection is fetched
        if (this.wait && !this.waitIsResolved) {
            return this.wait.then(() => {
                this.search(data);
                this.waitIsResolved = true;
            })
            .catch(err => log('error', err));
        }

        const {collection} = this.view.options;
        collection.reset(collection.fuzzySearch(data.text));
        this.view.trigger('toggle:dropdown', {length: collection.length});
    }

    /**
     * Create a new note.
     *
     * @returns {Promise}
     */
    createNote() {
        const title = this.view.ui.url.val().trim();

        return this.notesChannel.request('saveModelObject', {data: {title}})
        .then(model => {
            const url = Radio.request('utils/Url', 'getNoteLink', {model});
            this.resolve(`#${url}`);
        })
        .catch(err => log('createNote error', err));
    }

}
