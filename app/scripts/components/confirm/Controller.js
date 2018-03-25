/**
 * @module components/confirm/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import View from './View';
import deb from 'debug';

const log = deb('lav:components/confirm/Controller');

/**
 * Confirm controller.
 * The component can be used to show confirmation dialogs.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Radio channel (components/confirm)
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel('components/confirm');
    }

    /**
     * @listens this.channel#show - calls this.init method
     */
    constructor() {
        super();

        this.channel.reply({
            show: this.init,
        }, this);
    }

    /**
     * Initialize a new confirmation dialog.
     *
     * @param {Object} options
     * @param {String} options.content - content of the confirm dialog
     * @param {String} [options.title] - title of the confirm dialog
     * @param {Array} [options.buttons]  - confirmation buttons
     * @param {String} options.buttons.name
     * @param {String} options.buttons.event - event fired after the
     * button is clicked
     * @param {String} [options.buttons.class] - CSS class of the button
     * @returns {Promise}
     */
    init(options) {
        return new Promise((resolve, reject) => {
            this.show(options, {resolve, reject});
        });
    }

    /**
     * Show a confirmation dialog.
     *
     * @fires components/markdown#render
     * @param {Object} options
     * @param {Object} promise
     */
    show(options, promise) {
        return Radio.request('components/markdown', 'render', {
            content: options.content,
        })
        .then(content => {
            const view = new View(_.extend({}, options, {content}));
            Radio.request('Layout', 'show', {
                view,
                region: 'modal',
            });

            return this.listenToView({view, promise});
        })
        .catch(err => log('error', err));
    }

    /**
     * Listen to view events.
     *
     * @param {Object} data
     * @param {Object} data.view
     * @param {Object} data.promise
     */
    listenToView(data) {
        this.listenTo(data.view, 'answer', e => this.onAnswer(e, data));
        this.listenTo(data.view, 'destroy', () => this.onViewDestroy(data));
    }

    /**
     * A user answered to the confirmation dialog.
     *
     * @param {Object} e
     * @param {String} e.answer
     * @param {Object} data
     */
    onAnswer(e, data) {
        data.promise.resolved = true; // eslint-disable-line
        data.promise.resolve(e.answer);
        data.view.destroy();
    }

    /**
     * Stop listening to view events.
     *
     * @param {Object} data
     */
    onViewDestroy(data) {
        // Resolve the promise with reject if it wasn't resolved
        if (!data.promise.resolved) {
            data.promise.resolve('reject');
        }

        this.stopListening(data.view);
    }

}

Radio.once('App', 'init', () => new Controller());
