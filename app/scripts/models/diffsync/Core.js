/**
 * @module models/diffsync/Core
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';
import Diff from './Diff';
import Patch from './Patch';

const log = deb('lav:models/diffsync/Core');

/**
 * The core class for differential synchronization.
 * See {@link https://neil.fraser.name/writing/sync/} to read about diffsync.
 * Diffing is done in {@link module:models/diffsync/Diff}.
 * Patching is done in {@link module:models/diffsync/Patch}.
 *
 * @class
 * @license MPL-2.0
 */
export default class Core {

    /**
     * Radio channel (models/Diffsync)
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('models/Diffsync');
    }

    /**
     * Peer channel (models/Peer)
     *
     * @returns {Object}
     */
    get peerChannel() {
        return Radio.channel('models/Peer');
    }

    /**
     * App configs.
     *
     * @prop {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * profileId.
     *
     * @prop {String}
     */
    get profileId() {
        return Radio.request('collections/Profiles', 'getProfile');
    }

    constructor() {
        /**
         * Sync options.
         *
         * @prop {Object}
         * @prop {Number} wait - the amount of time it waits for a peer's
         * response
         * @prop {Object} docWait - the amount of time it waits before
         * checking a single document for changes (this.liveDoc)
         * @prop {Object} docsWait - the amount of time it waits before
         * checking several documents for changes
         */
        this.options = {
            profileId : this.profileId,
            configs   : this.configs,
            wait      : 30000,
            docWait   : {
                min   : 1000,
                max   : 5000,
                wait  : 1000,
            },
            docsWait  : {
                min   : 8000,
                max   : 20000,
                wait  : 8000,
            },
        };

        /**
         * Pending time outs. It will not compute new diffs until
         * it gets some response from a peer.
         *
         * @prop {Object}
         */
        this.pending = {};

        /**
         * An object that contains "locked" status of documents.
         *
         * @prop {Object}
         */
        this.locked = {};

        // Start replying to requests
        this.channel.reply({
            isLocked       : this.isLocked,
            lockDoc        : this.lockDoc,
            unlockDoc      : this.unlockDoc,
            isPending      : this.isPending,
            waitPeer       : this.waitPeer,
            stopPeerWait   : this.stopPeerWait,
            getClientPeers : this.getClientPeers,
        }, this);

        // Listen to peer events
        this.peerChannel.on('close:peer', this.onClosePeer.bind(this));
    }

    /**
     * Fetch all shadows, edits and start watching for changes.
     *
     * @see module:models/Patch
     * @see module:models/Diff
     * @returns {Promise}
     */
    init() {
        log('initialize');
        return this.findShadows()
        .then(() => {
            this.diff  = new Diff(this.options);
            this.patch = new Patch(this.options);
            this.diff.schedule();
        })
        .catch(err => log('error', err));
    }

    /**
     * Fetch shadows + edits and save them in this.options.
     *
     * @returns {Promise}
     */
    findShadows() {
        const opt = {profileId: this.profileId};

        return Promise.all([
            Radio.request('collections/Shadows', 'find', opt),
            Radio.request('collections/Edits', 'find', opt),
        ])
        .then(results => {
            this.options.shadows = results[0];
            this.options.edits   = results[1];
        });
    }

    /**
     * Return all peers who are connected to this peer as clients.
     *
     * @returns {Array}
     */
    getClientPeers() {
        const peers     = this.configs.peers;
        const connected = Radio.request('models/Peer', 'peers');
        log('peers', peers);

        // If the peer hasn't connected yet, assume it's a client peer
        return _.filter(peers, ({username, deviceId}) => {
            const conn = _.findWhere(connected, {username, deviceId});
            return !conn || conn.initiator;
        });
    }

    /**
     * Return true if a document is locked.
     *
     * @param {String} docType
     * @param {String} docId
     * @returns {Boolean}
     */
    isLocked(docType, docId) {
        return this.locked[`${docType}/${docId}`] === true;
    }

    /**
     * Lock a document.
     *
     * @param {String} docType - document type (notes, notebooks, tags...)
     * @param {String} docId - id of a document
     */
    lockDoc(docType, docId) {
        this.locked[`${docType}/${docId}`] = true;
    }

    /**
     * Unlock a document.
     *
     * @param {String} docType - document type (notes, notebooks, tags...)
     * @param {String} docId - id of a document
     */
    unlockDoc(docType, docId) {
        this.locked[`${docType}/${docId}`] = false;
    }

    /**
     * Return true if it's waiting for a peer to respond.
     *
     * @param {Object} peer
     * @returns {Boolean}
     */
    isPending(peer) {
        const pid = this.pending[`${peer.username}@${peer.deviceId}`];
        return (pid !== undefined && pid !== 0);
    }

    /**
     * Wait for a peer to respond before sending another packet.
     *
     * @param {Object} peer
     */
    waitPeer(peer) {
        const id = `${peer.username}@${peer.deviceId}`;
        this.stopPeerWait(peer);

        this.pending[id] = window.setTimeout(() => {
            this.pending[id] = 0;
        }, this.options.wait);
    }

    /**
     * Stop waiting for a peer to respond.
     *
     * @param {Object} peer
     */
    stopPeerWait(peer) {
        const id = `${peer.username}@${peer.deviceId}`;

        if (this.pending[id]) {
            window.clearTimeout(this.pending[id]);
            this.pending[id] = 0;
        }
    }

    /**
     * After a peer is destroyed and connection is lost, stop waiting for the
     * peer's response.
     *
     * @param {Object} {peer}
     */
    onClosePeer({peer}) {
        this.stopPeerWait(peer);
    }

}
