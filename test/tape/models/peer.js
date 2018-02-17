/**
 * Test models/Peer
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import {Buffer} from 'buffer';
import crypto from 'crypto';

import Radio from 'backbone.radio';
import _ from '../../../app/scripts/utils/underscore';
import Users from '../../../app/scripts/collections/Users';

const SimplePeer = sinon.stub();
const Peer       = proxyquire('../../../app/scripts/models/Peer', {
    'simple-peer': SimplePeer,
}).default;

let sand;
test('models/Peer: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('models/Peer: channel', t => {
    t.equal(Peer.prototype.channel.channelName, 'models/Peer');
    t.end();
});

test('models/Peer: configs', t => {
    const conf = {username: '1'};
    const req  = sand.stub(Radio, 'request').returns(conf);

    t.equal(Peer.prototype.configs, conf, 'returns configs');
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'makes "findConfigs" request');

    sand.restore();
    t.end();
});

test('models/Peer: user', t => {
    const attributes = {username: 'alice'};
    const req        = sand.stub(Radio, 'request')
    .withArgs('collections/Profiles', 'getUser')
    .returns({attributes});

    t.equal(new Peer().user, attributes);
    sand.restore();
    t.end();
});

test('models/Peer: channel', t => {
    t.equal(Peer.prototype.channel.channelName, 'models/Peer');
    t.end();
});

test('models/Peer: signal', t => {
    t.equal(Peer.prototype.signal.channelName, 'models/Signal');
    t.end();
});

test('models/Peer: constructor()', t => {
    const reply = sand.stub(Peer.prototype.channel, 'reply');
    const peer  = new Peer();

    t.equal(Array.isArray(peer.iceServers), true, 'creates "iceServers" property');
    t.equal(peer.iceServers.length, 2, 'STUN and TURN server list is not empty');

    t.equal(Array.isArray(peer.peers), true, 'creates "peers" property');
    t.equal(typeof peer.buffers, 'object', 'creates "buffers" property');

    t.equal(reply.calledWith({
        send        : peer.send,
        sendOfferTo : peer.sendOfferTo,
        peers       : peer.peers,
    }), true, 'starts replying to requests');

    sand.restore();

    const peer2 = new Peer();
    t.equal(peer2.channel.request('peers'), peer2.peers,
        '"peers" request returns "peers" property');

    t.end();
});

test('models/Peer: init()', async t => {
    const peer = new Peer();
    sand.stub(peer, 'fetchUsers').returns(Promise.resolve());
    const req  = sand.stub(peer.signal, 'request').returns(null);
    const on   = sand.stub(peer, 'onSignalConnect');

    await peer.init();
    t.equal(peer.fetchUsers.called, true, 'fetches users');
    t.equal(req.calledAfter(peer.fetchUsers), true, 'fetches users first');
    t.equal(req.calledWith('connect'), true, 'connects to the signaling server');
    t.equal(on.notCalled, true, 'does nothing if it was not able to connect');

    req.returns({socket: true});
    await peer.init();
    t.equal(on.called, true, 'calls "onSignalConnect" method');

    sand.restore();
    t.end();
});

test('models/Peer: fetchUsers()', async t => {
    const peer  = new Peer();
    const users = [{username: 'alice'}];
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve(users));

    await peer.fetchUsers();
    t.equal(req.calledWith('collections/Users', 'find'), true,
        'fetches all users');
    t.equal(peer.users, users, 'creates "users" property');

    sand.restore();
    t.end();
});

test('models/Peer: onSignalConnect()', t => {
    const peer   = new Peer();
    const socket = {on: sand.stub(), emit: sand.stub()};
    peer.users   = new Users([
        {username: 'alice2', pendingAccept: true, pendingInvite: false},
        {username: 'alice', pendingAccept: false, pendingInvite: false},
    ]);
    Object.defineProperty(peer, 'user', {
        get: () => {
            return {username: 'bob'};
        },
    });

    sand.stub(peer, 'sendOffers');
    peer.onSignalConnect({socket});
    t.equal(peer.socket, socket, 'creates "socket" property');

    t.equal(socket.on.calledWith('reconnect'), true,
        'listens to "reconnect" event');

    t.equal(socket.on.calledWith('requestOffer'), true,
        'listens to "requestOffer" event');
    t.equal(socket.on.calledWith('offer'), true,
        'listens to "offer" event');
    t.equal(socket.on.calledWith('signal'), true,
        'listens to "signal" event');

    t.equal(peer.sendOffers.called, true, 'sends offers to trusted users');

    sand.restore();
    t.end();
});

test('models/Peer: sendOfferTo()', t => {
    const peer  = new Peer();
    peer.socket = {emit: sand.stub()};
    peer.users  = new Users([{username: 'bob'}, {username: 'noone'}]);
    sand.stub(peer.users, 'getActive').returns(peer.users.where({username: 'bob'}));
    const user  = {username: 'alice'};
    Object.defineProperty(peer, 'user', {get: () => user});

    const users = peer.sendOffers();

    t.deepEqual(users, ['bob', 'alice']);
    t.equal(users.length, 2, 'sends offers to 2 users');
    t.equal(peer.socket.emit.calledWith('requestOffers', {users}), true,
        'sends offers to active users');

    sand.restore();
    t.end();
});

test('models/Peer: sendOfferTo()', t => {
    const peer   = new Peer();
    const socket = {emit: sand.stub()};
    peer.socket  = socket;

    peer.sendOfferTo({user: {username: 'alice', deviceId: '1'}});
    t.equal(socket.emit.calledWith('requestOffers', {
        users: [{username: 'alice', deviceId: '1'}],
    }), true, 'sends an offer to a specific user');

    sand.restore();
    t.end();
});

test('models/Peer: onReconnect()', t => {
    const peer = new Peer();
    sand.stub(peer, 'sendOffers');

    peer.onReconnect();
    t.equal(peer.sendOffers.called, true, 're-send offers to users');

    sand.restore();
    t.end();
});

test('models/Peer: getPeer()', t => {
    const peer = new Peer();
    peer.peers = [
        {username: 'bob', deviceId: '1'},
        {username: 'alice', deviceId: '2'},
    ];

    t.equal(peer.getPeer({username: 'bob', deviceId: '1'}), peer.peers[0],
        'returns "bobs" peer instance');

    t.equal(peer.getPeer({username: 'alice', deviceId: '2'}), peer.peers[1],
        'returns "alices" peer instance');

    t.equal(peer.getPeer({username: 'bob', deviceId: '2'}), undefined,
        'returns "undefined" if the peer does not exist');

    t.end();
});

test('models/Peer: isTrustedUser()', t => {
    const peer = new Peer();
    peer.users = new Users([
        {username: 'alice', pendingAccept: true, pendingInvite: false},
        {username: 'alice2', pendingAccept: true, pendingInvite: true},
    ]);
    const req  = sand.stub(peer.users.channel, 'request');
    Object.defineProperty(peer, 'user', {
        get: () => {
            return {username: 'bob'};
        },
    });

    t.equal(peer.isTrustedUser({username: 'bob'}), true,
        'returns false if the user send an offer to themselves');

    t.equal(peer.isTrustedUser({username: 'bob2'}), false,
        'returns false if the user does not exist');

    t.equal(peer.isTrustedUser({username: 'alice'}), false,
        'returns false if pendingAccept === true');
    t.equal(req.notCalled, true, 'does not make "acceptInvite" request');

    t.equal(peer.isTrustedUser({username: 'alice2'}), true,
        'returns true if pendingAccept === false');
    t.equal(req.calledWith('acceptInvite', {model: peer.users.at(1)}), true,
        'automatically accepts the invite if both users send invites to each other');

    sand.restore();
    t.end();
});

test('models/Peer: isTheSameDevice()', t => {
    const peer = new Peer();
    Object.defineProperty(peer, 'user', {
        get: () => {
            return {username: 'bob'};
        },
    });
    Object.defineProperty(peer, 'configs', {
        get: () => {
            return {deviceId: '1'};
        },
    });

    t.equal(peer.isTheSameDevice({username: 'bob', deviceId: '1'}), true,
        'returns "true"');
    t.equal(peer.isTheSameDevice({username: 'bob', deviceId: '2'}), false,
        'returns "false" if the device ID is different');
    t.equal(peer.isTheSameDevice({username: 'alice', deviceId: '1'}), false,
        'returns "false" if the username is different');

    t.end();
});

test('models/Peer: onRequestOffer()', t => {
    const peer  = new Peer();
    peer.peers  = [
        {username: 'bob', deviceId: '2', instance: {connected: true}},
        {username: 'bob', deviceId: '1', instance: {}},
        {username: 'bob', deviceId: '3', instance: {destroyed: true}},
        {username: 'bob', deviceId: '4', instance: {initiator: true}},
    ];
    sand.stub(peer, 'isTrustedUser').returns(false);
    peer.socket = {emit: sand.stub()};

    const pUser   = {username: 'bob'};
    Object.defineProperty(peer, 'user', {get: () => pUser});
    const configs = {deviceId: '1'};
    Object.defineProperty(peer, 'configs', {get: () => configs});

    peer.onRequestOffer({username: 'bob', deviceId: '2'});
    t.equal(peer.socket.emit.notCalled, true,
        'does nothing if the user is not trusted');

    peer.isTrustedUser.returns(true);
    peer.onRequestOffer({username: 'bob', deviceId: '1'});
    t.equal(peer.socket.emit.notCalled, true,
        'does nothing if the offer came from the same device');

    peer.onRequestOffer({username: 'bob', deviceId: '2'});
    t.equal(peer.socket.emit.notCalled, true,
        'does nothing if the peer instance already exists');

    peer.onRequestOffer({username: 'bob', deviceId: '3'});
    t.equal(_.findWhere(peer.peers, {deviceId: '3'}), undefined,
        'removes the peer from "peers" property');

    const user = {username: 'alice', deviceId: '2'};
    peer.onRequestOffer(user);
    t.equal(peer.socket.emit.calledWith('sendOffer', user), true,
        'sends the offer to the peer');

    sand.restore();
    t.end();
});

test('models/Peer: onOffer()', t => {
    const peer = new Peer();
    peer.peers = [
        {username: 'alice', deviceId: '1', instance: {initiator: false}},
        {username: 'alice', deviceId: '2', instance: {connected: true}},
        {username: 'alice', deviceId: '3', instance: {destroyed: true}},
    ];
    const isTrusted = sand.stub(peer, 'isTrustedUser').returns(false);
    sand.stub(peer, 'connectPeer');
    sand.stub(peer, 'destroyPeer');

    peer.onOffer({user: {username: 'alice', deviceId: '1'}});
    t.equal(peer.connectPeer.notCalled, true,
        'does nothing if the user is not trusted');

    isTrusted.returns(true);
    peer.onOffer({user: {username: 'alice', deviceId: '2'}});
    t.equal(peer.connectPeer.notCalled, true,
        'does nothing if the peer already exists');

    peer.onOffer({user: {username: 'alice', deviceId: '3'}, initiator: true});
    t.equal(peer.destroyPeer.called, true,
        'removes the peer from "peers" property');
    t.equal(peer.connectPeer.calledWith({username: 'alice', deviceId: '3'}, true),
        true, 'creates a new peer after destroying the old one');

    const user2 = {username: 'alice', deviceId: '4'};
    peer.onOffer({user: user2, initiator: false});
    t.equal(peer.connectPeer.calledWith(user2, false), true,
        'creates a new peer');

    sand.restore();
    t.end();
});

test('models/Peer: connectPeer()', t => {
    const peer     = new Peer();
    const instance = {connected: true};
    SimplePeer.returns(instance);
    sand.stub(peer, 'listenToPeer');
    sand.stub(peer, 'reconnectToPeer');

    peer.connectPeer({username: 'alice', deviceId: '1'});
    t.equal(SimplePeer.calledWith({
        initiator      : false,
        trickle        : true,
        config         : {iceServers: peer.iceServers},
        reconnectTimer : 2000,
    }), true, 'creates a new peer instance');
    t.equal(peer.reconnectToPeer.called, true, 'tries to reconnect to the peer');

    t.equal(peer.peers[0].instance, instance,
        'saves the peer instance in "peers" property');
    t.equal(peer.listenToPeer.calledWith(peer.peers[0]), true,
        'starts listening to peer events');

    peer.connectPeer({username: 'alice', deviceId: '2'}, true);
    t.equal(SimplePeer.calledWith({
        initiator      : true,
        trickle        : true,
        config         : {iceServers: peer.iceServers},
        reconnectTimer : 2000,
    }), true, 'creates a new initiating peer instance');
    t.equal(peer.reconnectToPeer.callCount, 1);

    sand.restore();
    t.end();
});

test('models/Peer: reconnectToPeer()', async t => {
    const peer    = new Peer();
    const peerObj = {username: 'alice', deviceId: '1'};
    const send    = sand.stub(peer, 'sendOfferTo');

    function waitPromise() {
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    peer.options.reconnectTimer = 10;
    peer.reconnectToPeer(_.extend({instance: {connected: true}}, peerObj));
    await waitPromise();
    t.equal(send.called, false, 'does not resend the offer if the peer is connected');

    peer.reconnectToPeer(_.extend({instance: {connected: false}}, peerObj));
    await waitPromise();
    t.equal(send.calledWithMatch({user: peerObj}), true, 'resends the offer');

    sand.restore();
    t.end();
});

test('models/Peer: listenToPeer()', t => {
    const peer    = new Peer();
    const on      = sand.stub();
    const peerObj = {instance: {on}};

    peer.listenToPeer(peerObj);

    t.equal(on.calledWith('error'), true, 'catches errors');
    t.equal(on.calledWith('close'), true, 'listens to "close" event');
    t.equal(on.calledWith('signal'), true, 'listens to "signal" event');
    t.equal(on.calledWith('connect'), true, 'listens to "connect" event');
    t.equal(on.calledWith('data'), true, 'listens to "data" event');

    sand.restore();
    t.end();
});

test('models/Peer: onPeerError()', t => {
    const peer = new Peer();
    const req  = sand.stub(Radio, 'request');
    sand.stub(peer, 'destroyPeer');

    const uPeer = {username: 'alice', deviceId: '2', instance: {}};
    peer.onPeerError(uPeer);
    t.equal(peer.destroyPeer.calledWith({peer: uPeer}), true, 'destroyes the peer');
    t.equal(req.calledWith('utils/Notify', 'show'), true,
        'shows a notification that there was an error');

    sand.restore();
    t.end();
});

test('models/Peer: onPeerClose()', t => {
    const peer  = new Peer();
    const send  = sand.stub(peer, 'sendOfferTo');
    peer.socket = {disconnected: true};
    sand.stub(peer, 'destroyPeer');

    peer.onPeerClose();
    t.equal(send.notCalled, true,
        'does nothing if the socket connection is not active');

    peer.socket = {disconnected: false};
    const user  = {username: 'alice', deviceId: '1'};
    peer.onPeerClose(user);
    t.equal(peer.destroyPeer.calledWith({peer: user}), true,
        'destroyes the peer');
    t.equal(send.calledWithMatch({user}), true, 'sends an offer to the user');

    sand.restore();
    t.end();
});

test('models/Peer: sendSignal()', t => {
    const peer   = new Peer();
    const req    = sand.stub(Radio, 'request').returns(Promise.resolve('sign'));
    peer.socket  = {emit: sand.stub()};
    const signal = {data: 'signal data'};

    const res = peer.sendSignal({signal, peer: {username: 'bob', deviceId: '1'}});
    t.equal(req.calledWith('models/Encryption', 'sign', {
        data: JSON.stringify({signal}),
    }), true, 'signs the signal data');

    res.then(() => {
        t.equal(peer.socket.emit.calledWith('sendSignal', {
            signal,
            signature : 'sign',
            to        : {username: 'bob', deviceId: '1'},
        }), true, 'sends the signal data to another peer with web sockets');

        sand.restore();
        t.end();
    });
});

test('models/Peer: onSignal()', t => {
    const peer   = new Peer();
    const signal = sand.stub();
    peer.peers   = [{username: 'alice', deviceId: '1', instance: {signal}}];
    const res = {signatures: [{valid: false}], data: JSON.stringify({signal: 'wrong'})};
    const req = sand.stub(Radio, 'request').returns(Promise.resolve(res));

    peer.onSignal({from: {username: 'alice', deviceId: '2'}});
    t.equal(req.notCalled, true, 'does nothing if a peer does not exist');

    sand.stub(peer, 'destroyPeer');
    const opt = {
        from      : {username: 'alice', deviceId: '1'},
        signal    : 'signal',
        signature : 'sign',
    };

    peer.onSignal(opt)
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'verify', {
            username: 'alice',
            message : 'sign',
        }), true, 'verifies the signature');

        t.equal(peer.destroyPeer.called, true,
            'destroyes the peer if the signature is invalid');

        res.signatures[0].valid = true;
        return peer.onSignal(opt);
    })
    .then(() => {
        t.equal(signal.notCalled, true,
            'does nothing if the signature data is incorrect');

        res.data = JSON.stringify({signal: 'signal'});
        return peer.onSignal(opt);
    })
    .then(() => {
        t.equal(signal.calledWith('signal'), true, 'accepts the signal');

        sand.restore();
        t.end();
    });
});

test('models/Peer: destroyPeer()', t => {
    const peer    = new Peer();
    const peerObj = {instance: {destroy: sand.stub()}};
    peer.peers    = [peerObj];

    peer.destroyPeer({peer: peerObj});
    t.equal(peerObj.instance.destroy.called, true, 'destroyes the peer instance');
    t.equal(peer.peers.length, 0, 'removes the peer from "peers" property');

    t.end();
});

test('models/Peer: onConnect()', t => {
    const peer    = new Peer();
    const peerObj = {instance: {connected: true}};
    const trig    = sand.stub(peer.channel, 'trigger');
    const req     = sand.stub(Radio, 'request');
    peer.peers    = [{username: 'alice', deviceId: '1', instance: {signal: 'test'}}];

    peer.onConnect({peer: peerObj});
    t.equal(req.calledWith('collections/Configs', 'updatePeer', peerObj), true,
        'adds the peer to the array of peers in configs');
    t.equal(req.calledWith('collections/Users', 'acceptIfPending', peerObj),
        true, 'confirm an invite sent to the user');

    t.equal(trig.calledWith('connected', {peer: peerObj}), true,
        'triggers "connected"');

    sand.restore();
    t.end();
});

test('models/Peer: send()', async t => {
    const peer    = new Peer();
    const buff    = {bufferId: 1, bufferLength: 10, chunks: ['1', '2', '3', '4']};
    const create  = sand.stub(peer, 'createBufferChunks').returns(Promise.resolve(buff));
    const peerObj = {
        username : 'alice',
        deviceId : '1',
        instance : {connected: false, send: sand.stub()},
    };
    peer.peers    = [peerObj];

    peer.send({peer: {username: 'alice', deviceId: '2'}});
    t.equal(create.notCalled, true, 'does nothing if the peer does not exist');

    peer.send({peer: {username: 'alice', deviceId: '1'}});
    t.equal(create.notCalled, true, 'does nothing if the peer is not connected');

    peerObj.instance.connected = true;
    peer.send({peer: {username: 'alice', deviceId: '1'}});
    t.equal(create.notCalled, true, 'does nothing if data is not provided');

    const data = {message: 'test'};
    const res  = await peer.send({data, peer: {username: 'alice', deviceId: '1'}});
    t.equal(create.calledWith(JSON.stringify(data)), true, 'msg');

    t.equal(peerObj.instance.send.callCount, buff.chunks.length,
        'sends all chunks to the peer');

    buff.chunks.forEach(chunk => {
        const str = JSON.stringify({
            chunk,
            bufferId     : buff.bufferId,
            bufferLength : buff.bufferLength,
        });
        const toSend = Buffer.from(str, 'utf8');
        t.equal(peerObj.instance.send.calledWith(toSend), true,
            'sends a chunk to a peer');
    });

    sand.restore();
    t.end();
});

test('models/Peer: createBufferChunks()', async t => {
    const peer = new Peer();
    function rand(len) {
        return crypto.randomBytes(len).toString('hex');
    }
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve(rand(32)));

    const str  = rand(20);
    const buff = Buffer.from(rand(20), 'utf8');

    const res = await peer.createBufferChunks(str);
    t.equal(req.calledWith('models/Encryption', 'random'), true,
        'uses a randomly generated buffer ID');
    t.equal(res.bufferLength, buff.length, 'has correct buffer length');
    t.equal(res.chunks.length, 1, 'correctly splits into chunks');
    t.equal(Array.isArray(res.chunks), true, 'is an array');

    const res2 = await peer.createBufferChunks(rand(2000));
    const buff2 = Buffer.from(rand(2000), 'utf8');
    t.equal(res2.bufferLength, buff2.length,
        `bufferLenth is equal to ${buff2.length}`);
    t.equal(res2.chunks[0].length, 1120, 'the chunks size is equal to 1120');
    t.equal(res2.chunks.length, Math.ceil(buff2.length / 1200),
        'correctly splits into chunks');

    sand.restore();
    t.end();
});

test('models/Peer: onData()', t => {
    const peer    = new Peer();
    const peerObj = {instance: 'instance'};
    const read    = sand.stub(peer, 'readBuffer');
    const trig    = sand.stub(peer.channel, 'trigger');

    // Does nothing
    peer.onData({peer: peerObj, data: 'buffer'});
    t.equal(trig.notCalled, true, 'does nothing if buffer is not ready');

    read.returns(JSON.stringify({type: 'unknown'}));
    peer.onData({peer: peerObj, data: 'buffer'});
    t.equal(trig.notCalled, true, 'does nothing if the type of data is unknown');

    // Emits "received:edits"
    read.returns(JSON.stringify({type: 'edits'}));
    peer.onData({peer: peerObj, data: 'buffer'});
    t.equal(read.calledWith('buffer'), true, 'reads the buffer');
    t.equal(trig.calledWith('received:edits', {
        peer: peerObj,
        data: {type: 'edits'},
    }), true, 'triggers "received:edits"');

    // Emits "received:response"
    read.returns(JSON.stringify({type: 'response'}));
    peer.onData({peer: peerObj, data: 'buffer'});
    t.equal(trig.calledWith('received:response', {
        peer: peerObj,
        data: {type: 'response'},
    }), true, 'triggers "received:response"');

    sand.restore();
    t.end();
});

test('models/Peer: readBuffer()', t => {
    const peer = new Peer();

    // Returns a string
    const buff = Buffer.from('Hello', 'utf8');
    const data = Buffer.from(JSON.stringify({
        bufferId     : '1',
        chunk        : buff.slice(0, 1200),
        bufferLength : buff.length,
    }), 'utf8');

    t.equal(peer.readBuffer(data), 'Hello', 'returns a string');

    // Returns undefined
    const data2 = Buffer.from(JSON.stringify({
        bufferId     : '1',
        chunk        : buff.slice(0, 1200),
        bufferLength : 2000,
    }), 'utf8');

    t.equal(peer.readBuffer(data2), undefined,
        'returns undefined if the buffer is not ready yet');

    sand.restore();
    t.end();
});
