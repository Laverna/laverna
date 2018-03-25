/**
 * @module collections/DiffCollection
 */
import _ from 'underscore';
import Collection from './Collection';

/**
 * Core collection for diffsync.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class DiffCollection extends Collection {

    /**
     * Find a shadow/edit for a particular document.
     *
     * @param {Object} peer - peer information (username, deviceId)
     * @param {Object} doc  - document model
     */
    findForDoc(peer, doc) {
        return this.findOrCreate({
            username : peer.username,
            deviceId : peer.deviceId,
            docId    : doc.id,
            docType  : doc.storeName,
        });
    }

    /**
     * Find a model or create a new one.
     *
     * @param {Object} data
     * @param {String} data.docId
     * @param {String} data.docType
     * @param {String} data.username
     * @param {String} data.deviceId
     * @returns {Object}
     */
    findOrCreate(data) {
        const mData = _.pick(data, 'docId', 'docType', 'username', 'deviceId');

        let model = this.findWhere(mData);
        if (model) {
            return model;
        }

        model = new this.model(mData);
        this.add(model);
        return model;
    }

}
