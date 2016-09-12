import Radio from 'backbone.radio';
import _ from 'underscore';

/**
 * Worker module. All classes that use WebWorkers should use this class.
 * With this, classes can use WebWorkers seamlessly.
 *
 * @class
 * @license MPL-2.0
 * @example
 * import WorkerModule from '../workers/Module';
 *
 * class MyClass extends WorkerModule {
 * }
 */
class Module {

    /**
     * Radio channel for requests and events. Mandatory property.
     *
     * @returns {String}
     */
    get channelName() {
        return 'workers/module';
    }

    /**
     * Radio channel.
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel(this.channelName);
    }

    /**
     * Requests to which the class needs to respond to.
     *
     * @returns {Object} key=value object
     * @example
     * return {
     *     'find:all': 'findAll',
     * }
     */
    get radioRequests() {
        return {};
    }

    constructor() {
        // Start listening to requests
        _.each(this.radioRequests, (method, request) => {
            this.channel.reply(request, (...args) => this.processRequest(method, args));
        });
    }

    /**
     * Process a Radio request.
     *
     * @param {String} method - requested method
     * @param {Array} args - arguments
     * @returns {Promises} - all methods should return a promise
     */
    processRequest(method, args) {
        /*
         * Execute local method if:
         * 1. It's a WebWorker instance
         * 2. WebWorkers are not supported
         */
        /* global WorkerLocation */
        if ((WorkerLocation && location instanceof WorkerLocation) ||
            !!window.Worker) {
            return this[method].apply(this, args);
        }

        // Execute the method in WebWorkers
        return this.delegateToWorker(method, args);
    }

    /**
     * Execute a method in webworkers.
     *
     * @fires workers/Delegator#execute
     * @param {String} method - method of this class that should be executed
     * @param {Array} args - arguments
     * @returns {Promise}
     */
    delegateToWorker(method, args) {
        /**
         * @event workers/Delegator#execute
         * @type {Object}
         * @property {Array} args
         * @property {String} method
         * @property {String} file
         */
        return Radio.request('workers/Delegator', 'execute', {
            args,
            method,
            file: this.channelName,
        });
    }

}

export default Module;
