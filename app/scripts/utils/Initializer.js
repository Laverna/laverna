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
 * Radio.request('utils/Initializer', 'add', 'app:before', promise);
 * @example
 * // Start the previously added callbacks.
 * // In this example it executes all callbacks with the key app:before
 * Radio.request('utils/Initializer', 'start', 'app:before', options);
 * @module Initializer
 * @class
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
     * Constructor.
     *
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
     * @param {String} name - name of the initializer
     * @param {Function} initializer
     */
    add(name, initializer) {
        this._inits[name] = this._inits[name] || [];
        this._inits[name].push(initializer);
        log(`added a callback to ${name}`);
    }

    /**
     * Start an initializer(s).
     * i.e. execute all scheduled callbacks with a key name/s.
     *
     * @param {String} name - name(s) of the initializer
     * @param {Object} options - options for scheduled callbacks
     * @returns {Promise} it will be resolved once all callbacks complete their tasks
     */
    start(name, options) {
        const names   = name.split(' ');
        const promise = Promise.resolve();
        log(`starting ${name} initializer/s`);

        _.each(names, name => {
            promise.then(() => this.startInit(name, options));
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
        const promises = [];

        // Get all callbacks by key name and execute
        _.each(this._inits[name], fnc => {
            promises.push(fnc(options));
        });

        return Promise.all(promises);
    }

}
