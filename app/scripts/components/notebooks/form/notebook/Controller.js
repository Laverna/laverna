/**
 * @module components/notebooks/form/notebook/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import deb from 'debug';

import View from './View';

const log = deb('lav:components/notebooks/form/notebook/Controller');

/**
 * Notebooks form controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Fetch data and show the notebook form.
     *
     * @returns {Promise}
     */
    init() {
        return this.fetch()
        .then(results => this.show(results[0], results[1]))
        .then(() => this.listenToEvents())
        .catch(err => log('error', err));
    }

    onDestroy() {
        log('destroy');
        this.fulfillPromise('resolve', {model: this.view.model});
        this.redirect();
    }

    /**
     * Fetch all notebooks and the notebook with the specified ID.
     *
     * @returns {Promise}
     */
    fetch() {
        log('options', this.options);
        return Promise.all([
            Radio.request('collections/Notebooks', 'find', this.options),
            Radio.request('collections/Notebooks', 'findModel', this.options),
        ]);
    }

    /**
     * Render the form view in modal region.
     *
     * @param {Object} collection - notebooks collection
     * @param {Object} model - Notebook model
     */
    show(collection, model) {
        // Show only notebooks which are not related to the current model
        const notebooks = collection.clone();
        notebooks.reset(notebooks.rejectTree(model.id));

        this.view = new View({
            notebooks,
            model,
            args: this.options,
        });

        Radio.request('Layout', 'show', {region: 'modal', view: this.view});
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        // Destroy itself if the view is destroyed
        this.listenTo(this.view, 'destroy', this.destroy);

        // Save changes
        this.listenTo(this.view, 'save', this.save);
        this.listenTo(this.view, 'cancel', () => this.view.destroy());
    }

    /**
     * Create/save a notebook.
     *
     * @returns {Promise}
     */
    save() {
        const data = {
            name     : this.view.ui.name.val().trim(),
            parentId : this.view.ui.parentId.val().trim(),
        };

        return Radio.request('collections/Notebooks', 'saveModel', {
            data,
            model: this.view.model,
        })
        .then(() => this.onSave())
        .catch(err => this.onSaveError(err));
    }

    /**
     * A notebook was created/saved.
     */
    onSave() {
        log('saved');
        // Resolve the promise
        this.fulfillPromise('resolve', {model: this.view.model});

        // Destroy the view
        this.view.destroy();
    }

    /**
     * Saving the notebook was unsuccessful.
     *
     * @param {Object} error
     */
    onSaveError(error) {
        log('saveModel error', error);
        this.fulfillPromise('reject', {error});
    }

    /**
     * Check if the controller was instantiated with a promise.
     * If it was, fulfill the promise.
     *
     * @param {String} action - resolve or reject
     * @param {Object} data
     */
    fulfillPromise(action, data) {
        if (this.options.promise) {
            this.options.promise[action](data);
            this.options.promise = null;
        }
    }

    /**
     * Navigate to notebooks page.
     */
    redirect() {
        const hash = Radio.request('utils/Url', 'getHash');

        // Redirect back only if it's notebooks page
        if (hash.search(/notebooks/) !== -1) {
            Radio.request('utils/Url', 'navigate', {
                trigger : false,
                url     : '/notebooks',
            });
        }
    }

}
