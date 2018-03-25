/**
 * @module models/diffsync/Model
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import jsondiffpatch from 'jsondiffpatch';
import fastpatch from 'fast-json-patch';

/**
 * Core model for diffsync models.
 *
 * @see module:models/Diff
 * @see module:models/Patch
 * @class
 * @license MPL-2.0
 */
export default class Diff {

    get channel() {
        return Radio.channel('models/Diffsync');
    }

    /**
     * Radio channel for peer model.
     *
     * @prop {Object}
     */
    get peerChannel() {
        return Radio.channel('models/Peer');
    }

    /**
     * Notes form channel.
     *
     * @prop {Object}
     */
    get formChannel() {
        return Radio.channel('components/notes/form');
    }

    /**
     * Keys which should be ignored in a document.
     *
     * @prop {Array}
     */
    get ignoreKeys() {
        return ['encryptedData', 'updated'];
    }

    constructor(options) {
        this.options = options;
        this.shadows = options.shadows;
        this.edits   = options.edits;

        /**
         * Fast diff & patch library used for file models.
         *
         * @prop {Object}
         */
        this.fastpatch = {
            diff  : fastpatch.compare,
            patch : (obj, patches) => {
                fastpatch.applyPatch(obj, patches);
                return obj;
            },
        };

        /**
         * JSONDiffPatch instance.
         *
         * @prop {Object}
         */
        this.jsondiffpatch = jsondiffpatch.create({
            textDiff: {
                minLength: 10,
            },
        });
    }

    /**
     * Return a diff library object.
     *
     * @param {String} docType
     * @returns {Object}
     */
    getDiff(docType) {
        if (docType !== 'files') {
            return this.jsondiffpatch;
        }

        // Use faster diff/patch lib for file attachments
        return this.fastpatch;
    }

    /**
     * Fetch all collections including notes, notebooks, tags...
     *
     * @returns {Promise} - resolves with an array of collections
     */
    findDocs() {
        // Fetch options
        const options = {
            profileId: this.options.profileId,
            perPage  : 0,
        };

        return Promise.all([
            Radio.request('collections/Notes', 'find', options),
            Radio.request('collections/Notebooks', 'find', options),
            Radio.request('collections/Tags', 'find', options),
            Radio.request('collections/Files', 'find', options),
            Radio.request('collections/Users', 'find', options),
        ]);
    }

    /**
     * Return all collections which contain models that are shared with a user.
     *
     * @param {String} username
     * @param {Array}  docs
     * @returns {Array}
     */
    findSharedDocs(username, docs) {
        let notes   = _.findWhere(docs, {storeName: 'notes'});
        notes       = notes.filter(model => model.isSharedWith(username));
        const files = this.findFileAttachments(docs, notes);
        return [notes, files];
    }

    /**
     * Return all files which are attached to shared notes.
     *
     * @param {Array} docs
     * @param {Array} notes
     * @returns {Array}
     */
    findFileAttachments(docs, notes) {
        const files = _.findWhere(docs, {storeName: 'files'});
        let ids     = _.map(notes, model => model.get('files'));
        ids         = _.uniq(_.flatten(ids));
        return files.filter(model => _.indexOf(ids, model.id) !== -1);
    }

    /**
     * Return model attributes which should be used for computing diffs.
     *
     * @param {Object} doc - document model
     * @param {String} username
     * @returns {Object}
     */
    getDocAttr(doc, username) { // eslint-disable-line complexity
        const attr     = _.pick(doc.attributes, _.keys(doc.defaults));
        let ignoreKeys = [].concat(this.ignoreKeys);

        // Get a note's content from the editor
        if (doc.storeName === 'notes' && this.liveDoc === doc) {
            attr.content = Radio.request('components/editor', 'getContent');
            attr.content = attr.content || doc.get('content');
        }

        // Don't let other users know whom the document is shared with
        if (username !== this.options.configs.username) {
            ignoreKeys = ignoreKeys.concat(['sharedBy', 'sharedWith', 'notebookId']);
        }

        return _.omit(attr, ignoreKeys);
    }

    /**
     * Find a shadow's/edit's collection.
     *
     * @param {Array} docs - an array of collections
     * @param {Object} shadow - shadow or edit model
     * @returns {Object}
     */
    findCollection(docs, shadow) {
        return _.findWhere(docs, {storeName: shadow.get('docType')});
    }

    /**
     * Find a shadow's or edit's doc
     *
     * @param {Array}  docs - an array of collections
     * @param {Object} edit - shadow or edit model
     * @param {String} sharedBy - the username of a peer which will be used
     * to create a new document in case if it does not exist
     */
    findDoc(docs, edit, sharedBy) {
        const collection = this.findCollection(docs, edit);
        return collection.findOrCreate(edit.get('docId'), {sharedBy});
    }

    /**
     * Find all edits that should be sent to a peer.
     *
     * @param {Object} peer
     * @returns {Array}
     */
    findPeerEdits(peer) {
        const edits = this.edits.where({
            username: peer.username,
            deviceId: peer.deviceId,
        });

        // Make sure it doesn't send un-encrypted data
        return _.map(edits, model => model.getData());
    }

    /**
     * Return an array of peers whom the document is shared with.
     *
     * @param {Object} doc
     */
    findDocPeers(doc) {
        const peers = this.channel.request('getClientPeers');

        return _.filter(peers, peer => {
            return (
                peer.username === this.options.configs.username ||
                peer.username === doc.get('sharedBy') ||
                _.indexOf(doc.get('sharedWith'), peer.username) !== -1
            );
        });
    }

}
