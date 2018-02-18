/**
 * @module components/notebooks/remove/Controller
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';

const log = deb('lav:components/notebooks/remove/Controller');

/**
 * Controller that handles the removal of notebooks and tags.
 *
 * @class
 * @license MPL-2.0
 */
export default class Controller {

    /**
     * Radio channel (components/notebooks)
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel('components/notebooks');
    }

    /**
     * Custom confirmation dialog buttons for notebooks.
     *
     * @returns {Array}
     */
    get notebookButtons() {
        const btnNotes = 'notebooks.remove with notes';
        return [
            {event: 'reject', name: 'Cancel'},
            {event: 'confirmNotes', name: btnNotes, class: 'btn-danger'},
            {event: 'confirm', name: 'notebooks.remove', class: 'btn-success'},
        ];
    }

    constructor() {
        this.channel.reply('remove', this.remove, this);
    }

    /**
     * Remove a notebook/tag model.
     *
     * @param {Object} options
     * @param {Object} options.model - notebook/tag model
     * @returns {Promise}
     */
    async remove(options) {
        const {model} = options;
        const res     = await this.showConfirm(model);
        this.requestRemove(model, res);
    }

    /**
     * Show a confirmation dialog asking if a user is sure
     * they want to remove a note.
     *
     * @param {Object} model
     * @returns {Promise}
     */
    showConfirm(model) {
        const data = {};
        data.content = _.i18n(`${model.storeName}.confirm remove`, model.attributes);

        // Notebooks confirm dialog has custom buttons
        if (model.storeName === 'notebooks') {
            data.buttons = this.notebookButtons;
        }

        log('show confirm');
        return Radio.request('components/confirm', 'show', data);
    }

    /**
     * Make remove request.
     *
     * @param {Object} model
     * @param {String} res - confirmation dialog result
     * if res is equal to confirmNotes, it will remove attached notes too
     * @returns {Promise}
     */
    requestRemove(model, res) {
        if (res === 'reject') {
            return;
        }

        const channel = model.storeName === 'tags' ? 'Tags' : 'Notebooks';

        return Radio.request(`collections/${channel}`, 'remove', {
            model,
            removeNotes: (res === 'confirmNotes'),
        });
    }

}

// Instantiate the controller immediately after the app starts
Radio.once('App', 'start', () => new Controller());
