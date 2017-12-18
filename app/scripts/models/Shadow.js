/**
 * @module models/Shadow
 */
import Model from './Model';
import _ from 'underscore';

/**
 * Shadow model.  Used in @see module:models/Diffsync
 * It stores shadow and backup versions of documents.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class Shadow extends Model {

    get storeName() {
        return 'shadows';
    }

    /**
     * Default values.
     *
     * @prop {String} id
     * @prop {String} username
     * @prop {String} deviceId
     * @prop {String} docType - notes, notebooks, tags, etc...
     * @prop {String} docId - ID of a note, notebook, tag...
     * @prop {Object} doc - contains a document data
     * @prop {Object} backup - the previous state of the shadow
     * @prop {String} encryptedData
     * @prop {Number} m - this peer's version
     * @prop {Number} p - another peer's version
     * @returns {Object}
     */
    get defaults() {
        return {
            id            : undefined,
            username      : '',
            deviceId      : '',
            docType       : '',
            docId         : '',
            doc           : {},
            backup        : {},
            encryptedData : '',
            m             : 0,
            p             : 0,
        };
    }

    /**
     * Attributes which need to be encrypted.
     *
     * @returns {Object}
     */
    get encryptKeys() {
        return [
            'doc',
            'backup',
        ];
    }

    get validateAttributes() {
        return ['docId', 'docType'];
    }

    /**
     * Create a full backup of the shadow.
     *
     * @param {Object} m - my version
     */
    createBackup(m) {
        const backup = _.pick(this.attributes, 'doc', 'm');
        backup.m     = m || backup.m;
        this.set({backup});
    }

    /**
     * Update a shadow doc and increase "m" or "p" version.
     *
     * @param {Object} doc
     * @param {String} version - version name that should be increased (m or p)
     */
    updateDoc(doc, version) {
        this.set({
            doc,
            [`${version}`]: this.get(version) + 1,
        });
    }

}
