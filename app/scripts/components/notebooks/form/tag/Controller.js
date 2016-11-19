/**
 * @module components/notebooks/form/tag/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import View from './View';
import deb from 'debug';

const log = deb('lav:components/notebooks/form/tag/Controller');

/**
 * Tag form controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    onDestroy() {
        log('destroyed');
        this.redirect();
    }

    /**
     * Fetch data and render the view.
     *
     * @returns {Promise}
     */
    init() {
        return this.fetch()
        .then(model => this.show(model))
        .then(() => this.listenToEvents())
        .catch(err => log('error', err));
    }

    /**
     * Fetch the tag model.
     *
     * @returns {Promise}
     */
    fetch() {
        return Radio.request('collections/Tags', 'findModel', this.options);
    }

    /**
     * Render the view.
     *
     * @param {Object} model
     */
    show(model) {
        this.view = new View({model});
        Radio.request('Layout', 'show', {region: 'modal', view: this.view});
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'save', this.save);
        this.listenTo(this.view, 'cancel', this.cancel);
    }

    /**
     * Save changes.
     *
     * @returns {Promise}
     */
    save() {
        const data = {
            name: this.view.ui.name.val().trim(),
        };

        return Radio.request('collections/Tags', 'saveModel', {
            data,
            model: this.view.model,
        })
        .then(() => this.view.destroy())
        .catch(err => log('error', err));
    }

    /**
     * Destroy the view.
     */
    cancel() {
        this.view.destroy();
    }

    /**
     * Navigate to notebooks page.
     */
    redirect() {
        Radio.request('utils/Url', 'navigate', {
            trigger        : false,
            url            : '/notebooks',
            includeProfile : true,
        });
    }

}
