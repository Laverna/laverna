/**
 * @module workers/Delegator
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import deb from 'debug';

const log = deb('lav:workers/Delegator');

/**
 * Delegate events, methods to WebWorkers.
 *
 * @class
 * @license MPL-2.0
 */
export default class Delegator {

    /**
     * Radio channel for events/requests.
     *
     * @prop {Object} Backbone Radio object
     */
    get channel() {
        return Radio.channel('workers/Delegator');
    }

    /**
     * WebWorker file.
     */
    get WebWorker() {
        return require('./worker.js');
    }

    /**
     * @param {Object} options = {}
     * @listens worker/Delegator#execute
     */
    constructor(options = {}) {
        log('initialized');

        this.options  = options;
        this.promises = [];

        // Start listening to requests
        this.channel.reply({
            execute: this.delegateMethod,
        }, this);

        this.channel.trigger('init');
    }

    /**
     * Delegate a method of a class/object to WebWorkers.
     *
     * @param {Object} data
     * @param {Array} data.args - arguments for a method
     * @param {String} data.method - method which should be executed
     * @param {String} data.file - relative path to class/object where method
     * is located
     * @returns {Promise}
     */
    delegateMethod(data) {
        log(`delegating method '${data.method}' to workers`);
        return this.postMessage('execute', data);
    }

    /**
     * Post a message to a WebWorker.
     *
     * @param {String} action
     * @param {Object} data
     * @returns {Promise}
     * @todo use transferable objects for files/images or large data (collection)
     */
    postMessage(action, data) {
        // Get the least loaded worker
        const worker = this.getWorker(data);

        // Increase the number of unresolved promises
        worker.unresolved += 1;

        return new Promise((resolve, reject) => {
            this.promises.push({resolve, reject});

            // Post the message to the worker
            const promiseId = this.promises.length - 1;
            const sdata  = {action, promiseId, data};
            log('sending data:', sdata);
            worker.instance.postMessage(sdata);
        });
    }

    /**
     * Spawn WebWorkers.
     */
    spawnWorkers() {
        // Assume there is only 1 core if the API isn't available
        const cpus   = window.navigator.hardwareConcurrency || 1;
        this.workers = [];

        // Spawn a Webworker for each CPU core
        log(`spawning ${cpus} workers`);
        for (let i = 0; i < cpus; i++) {
            this.workers.push(this.spawnWorker());
        }
    }

    /**
     * Spawn a new WebWorker.
     *
     * @listens Worker#message
     * @listens Worker#error
     * @returns {Object} worker instance
     */
    spawnWorker() {
        /**
         * @namespace
         * @param {Object} instance - WebWorker object
         * @param {Boolean} unresolved - number of unresolved worker promises
         */
        const worker = {
            instance   : new this.WebWorker(),
            unresolved : 0,
        };

        /**
         * @event Worker#message
         * @param {Event} evt
         */
        worker.instance.addEventListener('message', evt => this.onMessage(worker, evt));

        /**
         * @event Worker#error
         * @param {Error} err
         * @todo handle errors
         */
        worker.instance.addEventListener('error', err => log('error', err));

        return worker;
    }

    /**
     * Handle a message from a worker.
     *
     * @param {Object} worker - a webworker instance
     * @param {Event} evt
     */
    onMessage(worker, evt) {
        const msg = evt.data;
        log('delegator message', msg);

        switch (msg.action) {
            case 'resolve':
                this.onPromise(worker, msg);
                break;

            case 'reject':
                this.onPromise(worker, msg);
                break;

            default:
                log('unhandled message from a worker', msg);
        }
    }

    /**
     * Resolve/reject a promise.
     *
     * @param {Object} worker - Worker instance
     * @param {Object} msg - Message posted by a worker.
     */
    onPromise(worker, msg) {
        const promise = this.getPromise(msg.promiseId);

        // Resolve/reject a promise
        if (promise[msg.action]) {
            worker.unresolved -= 1; // eslint-disable-line
            promise[msg.action](msg.data);
            this.promises[msg.promiseId] = null;
        }
    }

    /**
     * Find and return the promise for a particular task.
     *
     * @param {String} id - id of the promise
     * @returns {Promise}
     */
    getPromise(id) {
        const promise = this.promises[id];

        if (!promise) {
            throw new Error(`Worker promise with #${id} does not exist`);
        }

        return promise;
    }

    /**
     * Return the least loaded WebWorker.
     *
     * @param {Object} data={}
     * @returns {Object} WebWorker instance
     */
    getWorker(data = {}) {
        /*
         * Use the first worker if:
         * 1. There is only one worker;
         * 2. It's an indexedDB operation (because it allows to have only
         * one instance)
         */
        if (this.workers.length === 1 || data.file === 'models/Db') {
            return this.workers[0];
        }

        // Try to find a worker that isn't in use
        let worker = _.findWhere(this.workers, {unresolved: 0});

        // Or use the least loaded worker
        if (!worker) {
            worker = _.sortBy(this.workers, worker => {
                return worker.unresolved;
            })[0];
        }

        return worker;
    }

}

/**
 * Initializer callback.
 *
 * @returns {(Boolean|Object)} - delegator object if WebWorkers are
 * supported or false.
 */
const initializer = () => {
    /* global Modernizr */
    if (!Modernizr.webworkers) {
        return false;
    }

    return new Delegator().spawnWorkers();
};

Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name: 'App:core',
        callback: initializer,
    });
});

export {initializer};
