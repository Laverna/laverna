/**
 * @module models/diffsync/Diff
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import DiffModel from './Model';

import deb from 'debug';

const log = deb('lav:models/diffsync/Diff');

/**
 * Compute diffs.
 *
 * @class
 * @extends module:models/diffsync/Model
 * @license MPL-2.0
 */
export default class Diff extends DiffModel {

    constructor(options) {
        super(options);

        log('diff init');

        /**
         * @prop {Object}
         * @prop {Number} doc  - ID of a scheduled check of a single document
         * @prop {Number} docs - ID of a scheduled check of documents
         */
        this.pids = {
            doc  : 0,
            docs : 0,
        };

        /**
         * A document that should be synchronized in real-time.
         *
         * @prop {Object}
         */
        this.liveDoc = null;

        /**
         * True if documents were patched recently.
         *
         * @prop {Boolean}
         */
        this.diffed = false;

        // Listen to editor events
        this.formChannel.on({
            ready            : this.onEditor,
            'before:destroy' : this.onEditorStop,
        }, this);

        this.channel.reply({
            liveDoc          : this.liveDoc,
            checkDoc         : this.checkDoc,
            checkCollections : this.checkCollections,
        }, this);
    }

    /**
     * Whenever a user opens the editor, start watching for changes in
     * a single document instead of several.
     *
     * @param {Object} model
     */
    onEditor({model}) {
        if (!model.id) {
            return log('A new model');
        }

        this.liveDoc = model;
        log('editing a model' , this.liveDoc);
        this.schedule();
    }

    /**
     * After the editor is closed, start watching for changes in several docs.
     */
    onEditorStop() {
        this.liveDoc = null;
        this.schedule();
    }

    /**
     * Start watching for changes in a document or documents.
     */
    schedule() {
        // Unschedule all checks
        this.unschedule('doc');
        this.unschedule('docs');

        const type = this.liveDoc ? 'doc' : 'docs';
        const wait = this.calcWait(type);

        // Schedule a check
        log('wait time is', wait);
        this.pids[type] = window.setTimeout(() => this[`${type}Sync`](), wait);
    }

    /**
     * Calculate the amount of time it should wait until the next check.
     *
     * @param {String} type - the type of synchronization (normal, live)
     * @returns {Number} wait time
     */
    calcWait(type) { // eslint-disable-line complexity
        const options    = this.options[`${type}Wait`];
        const {min, max} = options;
        const range      = max - min;
        const patched    = this.channel.request('patched');

        // Decrease the wait time by 40% if this peer changed something
        if (this.diffed) {
            options.wait -= (range * 0.4);
        }

        // Decrease the wait time by 20% if another peer changed something
        if (patched) {
            options.wait -= (range * 0.2);
        }

        // Increase the wait time by 10% if nothing has changed
        if (!this.diffed && !patched) {
            options.wait += (range * 0.1);
        }

        options.wait = Math.max(min, options.wait);
        options.wait = Math.min(max, options.wait);
        return options.wait;
    }

    /**
     * Stop watching for changes.
     *
     * @param {String} type - doc|docs
     */
    unschedule(type = 'doc') {
        if (this.pids[type]) {
            window.clearTimeout(this.pids[type]);
            this.pids[type] = 0;
        }
    }

    /**
     * Synchronize several documents.
     *
     * @returns {Promise}
     */
    docsSync() {
        log('checking all documents...');
        this.diffed  = false;

        return this.findDocs()
        .then(docs  => this.checkDocsPeers(docs))
        .then(()    => this.schedule())
        .catch(err  => log('error', err));
    }

    /**
     * Compute document diffs for several peers.
     *
     * @param {Array} docs
     * @returns {Promise}
     */
    checkDocsPeers(docs) {
        let promise = Promise.resolve();
        const peers = this.channel.request('getClientPeers');

        _.each(peers, peer => {
            if (this.channel.request('isPending', peer)) {
                return log(`still waiting for ${peer.username}'s response`);
            }

            promise = promise.then(() => this.checkCollections(peer, docs, true));
        });

        return promise;
    }

    /**
     * Check several collections for changes.
     *
     * @param {Object} peer
     * @param {Array} docs - an array of collections
     * @param {Boolean} send - true if the changes should be sent to a peer
     * (false for default)
     * @returns {Promise}
     */
    checkCollections(peer, docs, send = false) {
        let promise    = Promise.resolve();
        let sharedDocs = docs;

        // If it's another user, Find only collections which are shared with a peer
        if (peer.username !== this.options.configs.username) {
            sharedDocs = this.findSharedDocs(peer.username, docs);
            log('sharedDocs are', sharedDocs);
        }

        _.each(sharedDocs, doc => {
            promise = promise.then(() => this.checkDocs(peer, doc));
        });

        return promise.then(() => {
            log('finished checking docs...');
            if (send) {
                this.sendPeerDiffs(peer);
            }
        });
    }

    /**
     * Send edits to a peer.
     *
     * @param {Object} peer
     */
    sendPeerDiffs(peer) {
        // Find all edits which belong to the peer and send them in encrypted format
        const edits = this.findPeerEdits(peer);
        log(`sent diffs ${new Date().toString()}`, edits);

        // Start waiting for a peer's response
        this.channel.request('waitPeer', peer);

        this.peerChannel.request('send', {
            peer,
            data: {edits, type: 'edits'},
        });
    }

    /**
     * Check all documents in a collection.
     *
     * @param {Object} peer
     * @param {Object} collection
     * @returns {Promise}
     */
    checkDocs(peer, collection) {
        let promise = Promise.resolve();

        _.each(collection.models || collection, doc => {
            if (doc.id) {
                promise = promise.then(() => this.checkDoc(peer, doc));
            }
        });

        return promise;
    }

    /**
     * Synchronize a single document.
     *
     * @returns {Promise}
     */
    docSync() {
        this.diffed = false;

        return this.checkDocPeers(this.liveDoc, true)
        .then(()   => this.schedule())
        .catch(err => log('syncDoc error:', err));
    }

    /**
     * Compute diffs of a document for each peer.
     *
     * @param {Object} doc - a document model
     * @param {Boolean} send - true if the diff of a document should be send
     * to a peer immediately after diffing
     * @returns {Promise}
     */
    checkDocPeers(doc, send = false) {
        if (this.channel.request('isLocked', doc.storeName, doc.id)) {
            log(`document ${doc.storeName}/${doc.id} is locked!`);
            return Promise.resolve();
        }

        // Lock the document
        this.channel.request('lockDoc', doc.storeName, doc.id);
        let promise = Promise.resolve();

        _.each(this.findDocPeers(doc), peer => {
            if (this.channel.request('isPending', peer)) {
                log(`still waiting for a ${peer.username}'s response'`);
            }
            else {
                const user = _.pick(peer, 'username', 'deviceId');

                promise  = promise
                .then(() => this.checkDoc(user, doc))
                .then(() => {
                    if (send) {
                        this.sendDocDiffs(peer, doc);
                    }
                });
            }
        });

        return promise.then(() => {
            this.channel.request('unlockDoc', doc.storeName, doc.id);
        });
    }

    /**
     * Check if the document's changed. If it did, save the diff to the edit stack.
     *
     * @param {Object} peer - peer information
     * @param {Object} doc  - document model
     * @returns {Promise}
     */
    // eslint-disable-next-line complexity
    checkDoc(peer, doc) {
        // Ignore new models
        if (!doc.id) {
            return Promise.resolve();
        }

        const shadow     = this.shadows.findForDoc(peer, doc);
        const attributes = this.getDocAttr(doc, peer.username);
        log('checking the document....');

        // Compute the difference between the shadow and document
        const diff = this.getDiff(doc.storeName).diff(shadow.get('doc'), attributes);

        if (!diff || (Array.isArray(diff) && !diff.length)) {
            log('no change!');
            return Promise.resolve();
        }

        // Change "diffed" status
        this.diffed = true;
        log('the diff is', diff);

        const edit = this.edits.findForDoc(peer, doc);
        edit.addDiff({shadow, diff});
        shadow.updateDoc(attributes, 'm');

        return Promise.all([
            Radio.request('collections/Edits', 'saveModel', {model: edit}),
            Radio.request('collections/Shadows', 'saveModel', {model: shadow}),
            // Don't save the doc if it's a 'live' session (auto save will handle it)
            (this.liveDoc === doc ?
                Promise.resolve() :
                doc.channel.request('saveModel', {model: doc})
            ),
        ]);
    }

    /**
     * Send a document's diffs to the peer.
     *
     * @param {Object} peer
     * @param {Object} doc
     */
    sendDocDiffs(peer, doc) {
        log('sending diffs');

        // Start waiting for a peer's response
        this.channel.request('waitPeer', peer);

        const edit = this.edits.findForDoc(peer, doc).getData();
        this.peerChannel.request('send', {
            peer,
            data: {edits: [edit], type: 'edits'},
        });
    }

}
