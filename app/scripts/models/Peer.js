/**
 * @module models/Peer
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import SimplePeer from 'simple-peer';
// import isBuffer from 'is-buffer';
import deb from 'debug';
import {Buffer} from 'buffer';

const log = deb('lav:models/Peer');

/**
 * Peer class.
 * 1. Connect to the signaling server
 * 2. Connect peers with each other
 *
 * @class
 * @license MPL-2.0
 */
export default class Peer {

    /**
     * Application configs.
     *
     * @prop {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * Radio channel (models/Peer)
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('models/Peer');
    }

    /**
     * Signal model channel (models/Signal)
     *
     * @see module:models/Signal
     * @prop {Object}
     */
    get signal() {
        return Radio.channel('models/Signal');
    }

    constructor() {
        /**
         * {@link https://en.wikipedia.org/wiki/STUN|STUN}
         * and {@link https://en.wikipedia.org/wiki/TURN|TURN} server list.
         *
         * @prop {Array}
         */
        this.iceServers = [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
        ];

        /**
         * An array of connected peers.
         *
         * @prop {Array}
         */
        this.peers = [];

        /**
         * Store buffers received from other peers.
         *
         * @prop {Object}
         */
        this.buffers = {};

        // Reply to requests
        this.channel.reply({
            send        : this.send,
            sendOfferTo : this.sendOfferTo,
            peers       : this.peers,
        }, this);
    }

    /**
     * Connect to the signaling server.
     *
     * @returns {Promise}
     */
    init() {
        log('connecting...');

        return this.fetchUsers()
        .then(()   => this.signal.request('connect'))
        .then(res  => {
            log('connected to signaling server', this.users);
            if (res) {
                return this.onSignalConnect(res);
            }
        })
        .catch(err => log('error', err));
    }

    /**
     * Fetch all trusted users and save to "users" property.
     *
     * @returns {Promise}
     */
    fetchUsers() {
        return Radio.request('collections/Users', 'find')
        .then(users => this.users = users);
    }

    /**
     * On successful authentication on the signaling socket server,
     * request peer offers from other peers.
     *
     * @param {Object} socket - socket.io instance
     */
    onSignalConnect({socket}) {
        this.socket = socket;

        _.bindAll(this, 'onReconnect', 'onRequestOffer', 'onOffer', 'onSignal');

        // Socket.io events
        this.socket.on('reconnect', this.onReconnect);

        // Peer offer events
        this.socket.on('requestOffer', this.onRequestOffer);
        this.socket.on('offer', this.onOffer);
        this.socket.on('signal', this.onSignal);

        // Tell the signaling server to send offers to peers
        this.sendOffers();
    }

    /**
     * Send peer connection offers to other users.
     */
    sendOffers() {
        const users = _.pluck(_.pluck(this.users.getActive(), 'attributes'), 'username');
        users.push(this.configs.username);

        log('sending offers to', users);
        this.socket.emit('requestOffers', {users});
    }

    /**
     * Send an offer to a specific user.
     *
     * @param {Object} {user}
     */
    sendOfferTo({user}) {
        this.socket.emit('requestOffers', {users: [user]});
    }

    /**
     * Reconnected to the signaling server.
     */
    onReconnect() {
        log('reconnect');
        this.sendOffers();
    }

    /**
     * Return a peer object.
     *
     * @param {String} username - username
     * @param {String} deviceId
     * @returns {Object}
     */
    getPeer({username, deviceId}) {
        return _.findWhere(this.peers, {username, deviceId});
    }

    /**
     * Return "true" if the user's invite was accepted (pendingAccept = false).
     *
     * @param {Object} user
     * @returns {Boolean}
     */
    isTrustedUser(user) {
        if (user.username === this.configs.username) {
            return true;
        }

        const model = this.users.get(user.username);

        if (!model) {
            return false;
        }
        /*
         * If both users send invites to each other, it means
         * that the invite can be automatically accepted.
         */
        else if (model.get('pendingInvite') && model.get('pendingAccept')) {
            log('auto-accept the invite!');
            this.users.channel.request('acceptInvite', {model});
            return true;
        }

        return model.get('pendingAccept') === false;
    }

    /**
     * Return "true" if the offer was sent from the same device.
     *
     * @param {Object} user
     * @returns {Boolean}
     */
    isTheSameDevice(user) {
        return (
            user.username === this.configs.username &&
            user.deviceId === this.configs.deviceId
        );
    }

    /**
     * Send a peer offer.
     * The method is called on request:offer event.
     *
     * @param {Object} user
     * @param {String} user.username - the user who wants to establish connection
     * @param {String} user.deviceId
     */
    onRequestOffer(user) {// eslint-disable-line
        log('an offer', user);
        const peer = this.getPeer(user);

        if (!this.isTrustedUser(user)) {
            return log('Ignore the offer: untrusted user');
        }
        else if (this.isTheSameDevice(user) || (peer && peer.instance.connected)) {
            return log('Ignore the offer: the same device or the peer already exist');
        }
        else if (peer && peer.instance.destroyed) {
            this.peers = _.without(this.peers, peer);
        }

        this.socket.emit('sendOffer', user);
        this.connectPeer(user, false);
    }

    /**
     * Received a connection offer.
     *
     * @param {Object} user
     */
    onOffer(user) {
        const peer = this.getPeer(user);
        if (!this.isTrustedUser(user) || (peer && peer.instance.connected)) {
            return log('Ignoring the peer: untrusted user or peer already exists!');
        }
        else if (peer && peer.instance.destroyed) {
            this.peers = _.without(this.peers, peer);
        }

        // Make the receiving offer a peer an initiator
        this.connectPeer(user, true);
    }

    /**
     * Connect to a peer.
     *
     * @param {String} username
     * @param {String} deviceId
     * @param {Boolean} initiator=false
     */
    connectPeer({username, deviceId}, initiator = false) {
        const instance = new SimplePeer({
            initiator,
            trickle : true,
            config  : {iceServers: this.iceServers},
        });

        log(`connecting to a new peer ${username}/${deviceId}`);
        const peer = {username, deviceId, initiator, instance};
        this.peers.push(peer);
        this.listenToPeer(peer);
    }

    /**
     * Listen to peer events.
     *
     * @param {Object} peer - SimplePeer instance
     */
    listenToPeer(peer) {
        peer.instance.on('error', err => log('peer error', err));

        peer.instance.on('close', () => this.onPeerClose(peer));

        peer.instance.on('signal', signal => this.sendSignal({signal, peer}));

        peer.instance.on('connect', () => this.onConnect({peer}));

        peer.instance.on('data', data => this.onData({peer, data}));
    }

    /**
     * Try to re-connect to a peer after connection loss.
     *
     * @param {Object} peer
     */
    onPeerClose(peer) {
        // Do nothing if the socket connection is lost too
        if (this.socket.disconnected === true) {
            return;
        }

        log(`connection with @${peer.username} was dropped, reconnecting...`);
        const user = _.pick(peer, 'username', 'deviceId');
        this.sendOfferTo({user});
    }

    /**
     * Send signal information to another peer.
     *
     * @param {Object} signal
     * @param {Object} peer
     * @returns {Promise}
     */
    sendSignal({signal, peer}) {
        log('sending a signal info...', signal);
        const data = JSON.stringify({signal});

        return Radio.request('models/Encryption', 'sign', {data})
        .then(signature => {
            this.socket.emit('sendSignal', {
                signal,
                signature,
                to: {username: peer.username, deviceId: peer.deviceId},
            });
        })
        .catch(err => log('error', err));
    }

    /**
     * Received a signal data from another peer.
     *
     * @param {Object} data
     * @param {Object} data.from - {username,deviceId}
     * @param {String} data.signature
     * @param {String} data.signal
     */
    onSignal(data) {
        log('received signal', data);
        const peer = this.getPeer(data.from);

        if (!peer) {
            return log('peer does not exist', data);
        }

        return Radio.request('models/Encryption', 'verify', {
            username : data.from.username,
            message  : data.signature,
        })
        .then(res => {
            const signalData = JSON.stringify({signal: data.signal});

            if (!res.signatures[0].valid || res.data !== signalData) {
                log('Could not verify signal signature');
                return this.destroyPeer({peer});
            }

            log('verified the signature', res);
            peer.instance.signal(data.signal);
        })
        .catch(err => log('error', err));
    }

    /**
     * If the signature cannot be verified, destroy a peer connection.
     *
     * @param {Object} peer
     */
    destroyPeer({peer}) {
        peer.instance.destroy();
        this.peers = _.without(this.peers, peer);
    }

    /**
     * Established a connection with a peer.
     *
     * @fires this.channel#connected
     * @param {Object} peer
     */
    onConnect({peer}) {
        log('connected to a peer', peer);
        Radio.request('collections/Configs', 'updatePeer', peer);
        Radio.request('collections/Users', 'acceptIfPending', peer);
        this.channel.trigger('connected', {peer});
    }

    /**
     * Send something to a peer.
     *
     * @param {Object} peer
     * @param {String} peer.username
     * @param {String} peer.deviceId
     * @param {Object} data
     */
    send({peer, data}) {
        const peerObj = this.getPeer({username: peer.username, deviceId: peer.deviceId});

        if (!_.isObject(peerObj) || !peerObj.instance.connected || !data) {
            return log(`peer ${peer.username} ${peer.deviceId} is offline`);
        }

        return this.createBufferChunks(JSON.stringify(data))
        .then(buffer => {
            const {bufferId, bufferLength} = buffer;
            log('the buffer is', buffer);

            _.each(buffer.chunks, chunk => {
                const str = JSON.stringify({chunk, bufferId, bufferLength});
                peerObj.instance.send(Buffer.from(str, 'utf8'));
            });
        });
    }

    /**
     * Create a buffer from string and split it to chunks.
     *
     * @param {String} str
     * @returns {Promise} - resolves with an object which contains
     * an array of buffer chunks
     */
    createBufferChunks(str) {
        const buff   = Buffer.from(str, 'utf8');
        const chunks = [];

        /*
         * 1280 is WebRTC data API's MTU size from the spec.
         * Just to be safe, keep it under 1200 bytes.
         * 76 = bufferId key + bufferId + chunk key + 3 colons
         *      + 2 braces and commas + 12 quotation marks
         */
        const maxSize = 1200 - (76 + buff.length.toString().length);

        for (let i = 0; i < buff.length; i += maxSize) {
            chunks.push(buff.slice(i, i + maxSize));
        }

        return Radio.request('models/Encryption', 'random')
        .then(bufferId => {
            return {bufferId, chunks, bufferLength: buff.length};
        });
    }

    /**
     * Received data from another peer.
     *
     * @param {Object} peer - peer who send the message
     * @param {Object} data
     * @fires this.channel#received:edits
     * @fires this.channel#received:response
     */
    onData({peer, data}) {
        const res = this.readBuffer(data);

        if (!res) {
            // log('buffdata is not ready yet');
            return;
        }

        const obj = JSON.parse(res);
        log('received buffdata is', obj);

        switch (obj.type) {
            case 'edits':
                this.channel.trigger('received:edits', {peer, data: obj});
                break;

            case 'response':
                this.channel.trigger('received:response', {peer, data: obj});
                break;

            default:
        }
    }

    /**
     * Concatenate buffer chunks and return the result.
     *
     * @todo handle errors
     * @param {Array} data - buffer
     * @returns {Promise} - return string if all buffer chunks are received
     */
    readBuffer(data) {
        const res   = new Buffer(data).toString('utf8');
        const obj   = JSON.parse(res);

        let buffers = this.buffers[obj.bufferId] || [];
        buffers     = buffers.concat(obj.chunk.data);
        this.buffers[obj.bufferId] = buffers;

        // Received all buffer chunks
        if (buffers.length === obj.bufferLength) {
            this.buffers[obj.bufferId] = null;
            try {
                return new Buffer(buffers).toString('utf8');
            }
            catch (e) {
                log('buffer read error', e);
            }
        }
    }

}
