/**
 * @module components/notes/remove/Controller
 */
import Radio from 'backbone.radio';
import _ from 'underscore';

/**
 * Controller that handles removal of a note.
 *
 * @class
 * @license MPL-2.0
 */
export default class Controller {

    /**
     * Radio channel.
     */
    get channel() {
        return Radio.channel('components/notes');
    }

    /**
     * Confirm messages.
     *
     * @returns {Object}
     */
    get labels() {
        return {
            trash  : 'notes.confirm trash',
            remove : 'notes.confirm remove',
        };
    }

    constructor() {
        this.channel.reply('remove', this.remove, this);
    }

    /**
     * Remove a note.
     *
     * @param {Object} options
     * @param {Object} (options.model) - note model
     * @param {String} (options.id) - note ID
     * @returns {Promise}
     */
    remove(options) {
        if (options.model) {
            return this.removeModel(options);
        }
        else if (options.id) {
            return this.removeById(options);
        }
        else {
            return Promise.reject('Provide either ID or model.');
        }
    }

    /**
     * Remove a note by its ID.
     *
     * @param {Object} options
     * @param {String} options.id
     * @returns {Promise}
     */
    async removeById(options) {
        const model = await Radio.request('collections/Notes', 'findModel', options);
        return this.removeModel(_.extend({model}, options));
    }

    /**
     * Remove a note model from the database.
     *
     * @param {Object} options
     * @param {Object} options.model
     * @param {Boolean} (options.force) - remove a note without showing
     * a confirmation dialog
     * @returns {Promise}
     */
    async removeModel(options) {
        const {model} = options;

        const res = await (options.force ?  'confirm' : this.showConfirm(model));
        if (res !== 'confirm') {
            return;
        }

        return Radio.request('collections/Notes', 'remove', {model});
    }

    /**
     * Show a confirmation dialog asking if a user is sure
     * they want to remove a note.
     *
     * @param {Object} model
     * @returns {Promise}
     */
    showConfirm(model) {
        const label = Number(model.get('trash')) === 0 ? 'trash' : 'remove';

        return Radio.request('components/confirm', 'show', {
            content: _.i18n(this.labels[label], model.attributes),
        });
    }

}

// Instantiate the controller immediately after the app starts
Radio.once('App', 'start', () => new Controller());
