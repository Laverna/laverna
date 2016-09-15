/**
 * @file
 * @license MPL-2.0
 */
import Db from '../models/Db';

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
     * @property
     */
    modules: {
        'models/Db': new Db(),
    },

    /**
     * Post a response to the main thread.
     *
     * @param {String} promiseId
     * @param {Object} data - result of executing a method
     * @param {String} action - (resolve|reject)
     */
    postResponse(promiseId, data, action) {
        const sdata = JSON.stringify({data, promiseId, action});
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
    const msg = JSON.parse(evt.data);
    log('received a message from the main thread', msg);

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
self.addEventListener('message', evt => onMessage(evt));

/**
 * @event worker#error
 */
self.addEventListener('error', err => log('error', err));

export default {delegator, onMessage};
