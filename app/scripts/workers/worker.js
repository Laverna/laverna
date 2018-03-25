/**
 * @module workers/worker
 * @license MPL-2.0
 */
import Db from '../models/Db';

// Prevent Prismjs from using our Webworker messages
const addEventListener = self.addEventListener;
self.addEventListener  = undefined;
const Markdown = require('../components/markdown/Markdown').default;

function log(...args) {
    args.unshift('%cworkers/worker', 'color:red;background:gray');
    // eslint-disable-next-line
    console.log.apply(console, args);
}

/**
 * Delegate methods to classes.
 *
 * @namespace delegator
 */
const delegator = {

    /**
     * Holds class instances with their relative paths.
     *
     * @param {Object}
     */
    modules: {
        'models/Db': new Db(),
        'components/markdown': new Markdown(),
    },

    /**
     * Post a response to the main thread.
     *
     * @param {String} promiseId
     * @param {Object} data - result of executing a method
     * @param {String} action - (resolve|reject)
     */
    postResponse(promiseId, data, action) {
        const sdata = {data, promiseId, action};
        log(`${action} the promise`);
        self.postMessage(sdata);
    },

    /**
     * Execute a method of a class.
     *
     * @param {String} promiseId - id of the promise
     * @param {Object} data
     */
    execute(promiseId, data) {
        if (!data.file || !this.modules[data.file]) {
            return this.postResponse(promiseId, 'Class does not exist', 'reject');
        }

        const module = this.modules[data.file];

        if (!module[data.method]) {
            return this.postResponse(promiseId, 'Method does not exist', 'reject');
        }

        // Execute the method
        return module[data.method].apply(module, data.args)
        .then(res => this.postResponse(promiseId, res, 'resolve'))
        .catch(err => this.postResponse(promiseId, err, 'reject'));
    },

};

/**
 * Handle messages from the main thread
 *
 * @param {Object} evt
 */
function onMessage(evt) {
    const msg = evt.data;
    log(`${msg.action}: ${msg.data.file}.${msg.data.method}()`, msg.data.args);

    switch (msg.action) {
        case 'execute':
            delegator.execute(msg.promiseId, msg.data);
            break;

        default:
            log('Unhandled message from the main thread', msg);
    }
}

/**
 * @event worker#message
 */
addEventListener('message', evt => onMessage(evt));

/**
 * @event worker#error
 */
addEventListener('error', err => log('error', err));

export {delegator, onMessage};
