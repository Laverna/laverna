/**
 * @file
 * @license MPL-2.0
 */
import Db from '../models/Db';

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
        self.postMessage({data, promiseId, action});
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

    switch (msg.action) {
        case 'execute':
            delegator.execute(msg.promiseId, msg.data);
            break;

        default:
            // eslint-disable-next-line
            console.log('Unhandled message from the main thread', msg);
    }
}

/**
 * @event worker#message
 */
self.addEventListener('message', evt => onMessage(evt));

export default {delegator, onMessage};
