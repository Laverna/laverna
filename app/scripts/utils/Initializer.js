/**
 * @module utils/Initializer
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';

const log = deb('lav:utils/Initializer');

/**
 * Add and execute asynchronous callbacks which can be
 * started later by requesting them with Backbone.Radio.
 *
 * @example
 * // Add a new callback to an array of callbacks.
 * // It can be found later by the key app:before
 * Radio.request('utils/Initializer', 'add', {
 *     name    : 'app:before',
 *     callback: asyncCallback,
 * });
 * @example
 * // Start the previously added callbacks.
 * // In this example it executes all callbacks with the key App:before
 * Radio.request('utils/Initializer', 'start', {
 *     inits  : ['App:before'],
 *     options: {},
 * );
 * @license MPL-2.0
 */
export default class Initializer {

    /**
     * Channel to which it replies and triggers events.
     *
     * @returns {Object} Backbone.Radio object
     */
    get channel() {
        return Radio.channel('utils/Initializer');
    }

    /**
     * @listens utils/Initializer#add - schedule a callback
     * @listens utils/Initializer#start - execute scheduled callbacks
     * @fires utils/Initializer#init
     */
    constructor() {
        this._inits = {};

        // Start replying to requests
        this.channel.reply({
            add   : this.add,
            start : this.start,
        }, this);

        /**
         * Initializer is ready to schedule callbacks.
         *
         * @event utils/Initializer#init
         */
        this.channel.trigger('init');
    }

    /**
     * Schedule a callback.
     * i.e. attach to an array of callbacks.
     *
     * @param {Object} init - object with init information
     * @param {String} init.name - a key of the initializer
     * to which the callback needs to be attached.
     * @param {Function} init.callback - a function-callback which
     * needs to be attached to an initializer.
     */
    add(init) {
        this._inits[init.name] = this._inits[init.name] || [];
        this._inits[init.name].push(init.callback);
        log(`added a callback to ${init.name} array`);
    }

    /**
     * Start an initializer(s).
     * i.e. execute all scheduled callbacks with a key name/s.
     *
     * @param {(String|Object)} data - key(s) of the initializer or object
     * that contains keys of initializers and options
     * @param {Array} data.names - array with keys of initializers
     * which should be started
     * @param {Object} data.options - options for callbacks
     * @returns {Promise} it will be resolved once all callbacks complete their tasks
     */
    start(data) {
        const dataObj = _.isObject(data) ? data : {names: data.split(' ')};
        let promise   = Promise.resolve();

        _.each(dataObj.names, name => {
            log(`starting ${name}`);
            promise = promise.then(() => this.startInit(name, data.options || {}));
        });

        return promise;
    }

    /**
     * Execute all callbacks of a particular initializer.
     * i.e. callbacks that are saved in this._inits[name].
     *
     * @param {String} name - name of an initializer
     * @param {Object} options
     * @returns {Promise} it will be resolved once all callbacks complete their tasks
     */
    startInit(name, options) {
        let promise = Promise.resolve();

        // Get all callbacks by key name and execute
        _.each(this._inits[name] || [], fnc => {
            promise = promise.then(() => fnc(options));
        });

        return promise;
    }

}
