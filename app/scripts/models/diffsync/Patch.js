/**
 * @module models/diffsync/Patch
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import DiffModel from './Model';
import Edit from '../Edit';

import deb from 'debug';

const log = deb('lav:models/diffsync/Patch');

/**
 * Apply patches.
 *
 * @class
 * @extends module:models/diffsync/Model
 * @license MPL-2.0
 */
export default class Patch extends DiffModel {

    constructor(...args) {
        super(...args);

        /**
         * True if a document was patched.
         *
         * @prop {Boolean}
         */
        this.patched = false;

        this.channel.reply({
            patched: this.patched,
        }, this);

        this.peerChannel.on({
            'received:edits'   : this.onReceivedEdits,
            'received:response': this.onResponse,
        }, this);
    }

    /**
     * Received edit diffs from another peer.
     *
     * @param {Object} peer
     * @param {Object} data
     * @param {Array}  data.edits - a collection of edit models
     * @returns {Promise}
     */
    onReceivedEdits({peer, data}) {
        log(`received edits ${new Date().toString()}`);
        this.patched = false;
        if (this.channel.request('isPending', peer)) {
            return log(`ignoring ${peer.username}'s edits: waiting for response`);
        }

        log('patching...');
        return this.findDocs()
        .then(docs => {
            this.applyEdits({peer, data, docs})
            .then(() => this.onPatch(data.edits, peer, docs));
        })
        .catch(err => log('error', err));
    }

    /**
     * Send a response after applying patches.
     *
     * @returns {Promise}
     */
    onPatch(edits, peer, docs) {
        log('responding...');
        if (edits.length === 1 && this.channel.request('liveDoc')) {
            return this.respondDocDiff(edits[0], peer, docs);
        }

        return this.respondDocsDiff(peer, docs);
    }

    /**
     * Respond with diffs of all documents.
     *
     * @param {Object} peer
     * @param {Array} docs
     * @returns {Promise}
     */
    respondDocsDiff(peer, docs) {
        return this.channel.request('checkCollections', peer, docs)
        .then(() => {
            const edits = this.findPeerEdits(peer);
            log('edits', edits);

            this.peerChannel.request('send', {
                peer,
                data: {edits, type: 'response'},
            });
        });
    }

    /**
     * Respond with a document's diff.
     *
     * @todo check if the document is shared with a peer
     * @param {Object} peerEdit
     * @param {Object} peer
     * @param {Array} docs
     * @returns {Promise}
     */
    respondDocDiff(peerEdit, peer, docs) {
        const edit = new Edit(peerEdit);
        const doc  = this.findDoc(docs, edit);

        return this.channel.request('checkDoc', peer, doc)
        .then(() => {
            log('sending response');
            const edit = this.edits.findForDoc(peer, doc).getData();

            this.peerChannel.request('send', {
                peer,
                data: {edits: [edit], type: 'response'},
            });
        });
    }

    /**
     * The peer completed applying our patches.
     *
     * @param {Object} peer
     * @param {Object} data
     */
    onResponse({peer, data}) {
        log('received response', peer, data);
        this.patched = false;
        this.channel.request('stopPeerWait', peer);

        return this.findDocs()
        .then(docs => this.applyEdits({peer, data, docs}))
        .catch(err => log('error', err));
    }

    /**
     * Apply edits.
     *
     * @param {Object} peer
     * @param {Object} data
     * @param {Object} docs - an array of collections
     */
    applyEdits({peer, data, docs}) {
        let promise = Promise.resolve();

        _.each(data.edits, edit => {
            if (edit.docId && edit.docType) {
                promise = promise.then(() => this.applyEdit({peer, edit, docs}));
            }
        });

        return promise;
    }

    /**
     * Apply an edit to a shadow.
     *
     * @param {Object} data
     * @param {Object} data.edit
     * @param {Array}  data.docs
     * @param {Object} data.peer
     */
    applyEdit(data) {
        const {docType, docId} = data.edit;
        if (this.channel.request('isLocked', docType, docId)) {
            return log('cannot patch: the document is locked');
        }

        // Patch data
        const peerEdit = new Edit(data.edit);
        const doc      = this.findDoc(data.docs, peerEdit, data.peer.username);
        const shadow   = this.shadows.findForDoc(data.peer, doc);
        const edit     = this.edits.findForDoc(data.peer, doc);

        // If document is not shared with a user, do not apply the patch.
        if (!doc.isSharedWith(edit.get('username'))) {
            return log('cannot patch: not shared');
        }

        // Lock the document
        this.channel.request('lockDoc', docType, docId);

        return Radio.request('models/Encryption', 'decryptModel', {model: peerEdit})
        .then(() => {
            const pData = {peerEdit, doc, shadow, edit, peer: data.peer};

            if (shadow.get('m') !== peerEdit.get('p')) {
                return this.rollback(pData);
            }

            return this.patch(pData);
        })
        .then(() => this.channel.request('unlockDoc', docType, docId));
    }

    /**
     * Rollback the shadow from a backup, clear edits, and patch shadows, docs.
     *
     * @param {Object} data
     * @returns {Promise}
     */
    rollback(data) {
        const {shadow, peerEdit} = data;
        const backup = shadow.get('backup');
        const p      = peerEdit.get('p');

        if (backup.m !== p) {
            return log(`Backup version missmatch: ${backup.m} != ${p}`);
        }

        // Rollback and clear diffs
        shadow.set(backup);
        data.edit.set('diffs', []);
        log(`Recovered from backup - ${peerEdit.get('docId')}`);

        // Try to patch
        return this.patch(data);
    }

    /**
     * Apply diffs to a shadow and document.
     *
     * @param {Object} data
     */
    patch(data) { // eslint-disable-line complexity
        const diffs = data.peerEdit.get('diffs');

        // If both diffs are empty, do nothing
        if (!diffs.length && !data.edit.get('diffs').length) {
            return Promise.resolve();
        }

        // Apply patches
        _.each(diffs, diff => this.patchDiff(data, diff));

        // Create a shadow backup and clear the edit stack
        data.shadow.createBackup(data.shadow.get('m'));

        // Clear diffs
        data.edit.clearDiffs({shadow: data.shadow});

        const promises = [
            this.edits.channel.request('saveModel', {model: data.edit}),
            this.shadows.channel.request('saveModel', {model: data.shadow}),
        ];

        // Save the document only if it's changed
        if (data.doc.get('changed') && this.liveDoc !== data.doc) {
            promises.push(data.doc.channel.request('saveModel', {model: data.doc}));
        }

        log('finished patching', data.doc.attributes);
        return Promise.all(promises);
    }

    /**
     * Apply a single diff to a shadow and document.
     *
     * @param {Object} data
     * @param {Object} diff
     */
    patchDiff({shadow, doc}, diff) {
        if (shadow.get('p') !== diff.m) {
            return log(`Ignoring the diff: ${shadow.get('p')} != ${diff.m}`);
        }

        // Change "patched" status
        this.patched = true;

        // Patch the shadow
        const diffpatch = this.getDiff(doc.storeName);
        const shadowDoc = diffpatch.patch(shadow.get('doc'), diff.diff);
        shadow.updateDoc(shadowDoc, 'p');

        // Patch the document
        const docData = doc.id ? this.getDocAttr(doc, shadow.get('username')) : {};
        doc.set(diffpatch.patch(docData, diff.diff));
        doc.set('changed', true);
        doc.channel.trigger(`save:object:${doc.id}`);
        log('patched version of the doc is', doc.attributes);
    }

}
