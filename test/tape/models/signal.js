/**
 * Test models/Signal
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import $ from 'jquery';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';

const socket = {on: () => {}, once: () => {}};
const io     = sinon.stub().returns(socket);
const Signal = proxyquire('../../../app/scripts/models/Signal', {
    'socket.io-client': io,
}).default;

let sand;
test('models/Signal: before()', t => {
    sand = sinon.sandbox.create();
    Radio.channel('collections/Configs').reply('findConfigs', () => {
        return {server: 'https://laverna.cc'};
    });

    t.end();
});

test('models/Signal: channel', t => {
    t.equal(Signal.prototype.channel.channelName, 'models/Signal');
    t.end();
});

test('models/Signal: configs', t => {
    const conf = {config: 'test'};
    const req  = sand.stub(Radio, 'request');

    req
    .withArgs('collections/Configs', 'findConfigs')
    .returns(conf);

    t.equal(Signal.prototype.configs, conf, 'returns configs');
    sand.restore();
    t.end();
});

test('models/Signal: constructor()', t => {
    const reply  = sand.stub(Signal.prototype.channel, 'reply');
    // const change = sand.stub(Signal.prototype, 'changeServer');
    const sig    = new Signal({});

    t.equal(typeof sig.options, 'object', 'creates "options" property');
    // t.equal(change.called, true, 'changes the signaling server address');

    t.equal(reply.calledWith({
        changeServer : sig.changeServer,
        connect      : sig.connect,
        register     : sig.register,
        findUser     : sig.findUser,
        sendInvite   : sig.sendInvite,
        removeInvite : sig.removeInvite,
    }), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('models/Signal: changeServer()', t => {
    const sig = new Signal();
    Object.defineProperty(sig, 'configs', {get: () => {
        return {signalServer: 'https://laverna.cc'};
    }});

    sig.changeServer({signal: 'http://localhost:3000'});
    t.equal(sig.options.server, 'http://localhost:3000');

    sig.changeServer();
    t.equal(sig.options.server, 'https://laverna.cc');

    t.end();
});

test('models/Signal: findUser()', t => {
    const sig = new Signal();
    sand.stub($, 'get').returns(Promise.reject({status: 404}));

    sig.findUser({username: 'test'})
    .then(res => {
        t.equal($.get.calledWith(`${sig.options.api}/users/name/test`), true,
            'makes an API request');
        t.equal(res, null, 'returns "null"');

        $.get.returns(Promise.reject({status: '0'}));
        return sig.findUser({username: 'test'});
    })
    .catch(() => {
        t.pass('throws an error');

        sand.restore();
        t.end();
    });
});

test('models/Signal: register()', t => {
    const sig  = new Signal();
    sand.stub($, 'post').returns(Promise.resolve());
    const data = {
        username  : 'bob',
        publicKey : 'bobs public key',
    };

    t.equal(typeof sig.register(data).then, 'function', 'returns a promise');
    t.equal($.post.calledWith(`${sig.options.api}/users`, data), true,
        'makes an API request');

    sand.restore();
    t.end();
});

test('models/Signal: connect()', t => {
    const sig     = new Signal();

    const device  = sand.stub(sig, 'createDeviceId').returns(Promise.resolve());
    sand.stub(sig, 'auth').returns({success: null});
    const connect = sand.stub(sig, 'connectToSignal').returns(Promise.resolve());

    sig.connect()
    .then(() => {
        t.equal(device.called, true, 'generates the device ID');
        t.equal(sig.auth.calledAfter(device), true,
            'tries to authenticate on the server');
        t.equal(connect.notCalled, true,
            'does not connect to the socket server if auth failed');

        sig.auth.returns({success: true, token: 'token'});
        return sig.connect();
    })
    .then(() => {
        t.equal(connect.calledAfter(sig.auth), true,
            'connects to the socket server');
        t.equal(connect.calledWith('token'), true, 'passes the token');

        sand.restore();
        t.end();
    });
});

test('models/Signal: createDeviceId()', t => {
    const sig = new Signal();
    const req = sand.stub(Radio, 'request');
    req.withArgs('collections/Configs', 'findConfigs').returns({deviceId: '1'});

    sig.createDeviceId();
    t.equal(req.calledWith('collections/Configs', 'createDeviceId'), false,
        'does not generate a new device ID if it was done before');

    req.withArgs('collections/Configs', 'findConfigs').returns({deviceId: ''});
    sig.createDeviceId();
    t.equal(req.calledWith('collections/Configs', 'createDeviceId'), true,
        'generates a new device ID');

    sand.restore();
    t.end();
});

test('models/Signal: connectToSignal()', t => {
    const sig = new Signal();
    Object.defineProperty(sig, 'configs', {
        get: () => {
            return {username: 'bob', deviceId: '1'};
        },
    });
    sand.stub(socket, 'on');
    sand.stub(socket, 'once');

    const res = sig.connectToSignal('token');

    t.equal(io.calledWith(sig.options.server, {
        query: 'username=bob&deviceId=1&token=token',
    }), true, 'connects to the socket server');

    t.equal(socket.on.calledWith('error', sig.onSocketError), true,
        'listens to error events');
    t.equal(socket.on.calledWith('invite'), true, 'listens to "invite" event');

    t.equal(typeof res.then, 'function', 'returns a promise');

    sand.restore();
    t.end();
});

test('models/Signal: onSocketError()', t => {
    new Signal().onSocketError();
    t.end();
});

test('models/Signal: auth()', t => {
    const sig = new Signal();
    Object.defineProperty(sig, 'configs', {
        get: () => {
            return {publicKey: 'pub', username: 'bob'};
        },
    });

    sand.stub($, 'get').returns(Promise.resolve('token'));
    sand.stub($, 'post');
    sand.stub(sig, 'createSignature').returns('sign');
    const key = {primaryKey: {fingerprint: 'print'}};
    sand.stub(openpgp.key, 'readArmored').returns({keys: [key]});

    sig.auth()
    .then(() => {
        t.equal($.get.calledWith(`${sig.options.api}/token/bob`), true,
            'requests a random token for the signature from the server');
        t.equal(sig.createSignature.calledWith('token'), true,
            'signs the authentication request');

        t.equal($.post.calledWith(`${sig.options.api}/auth`, {
            signature   : 'sign',
            fingerprint : 'print',
            username    : 'bob',
        }), true, 'makes an auth request');

        sand.restore();
        t.end();
    });
});

test('models/Signal: createSignature()', t => {
    const sig = new Signal();
    const req = sand.stub(Radio, 'request');
    Object.defineProperty(sig, 'user', {
        get: () => {
            return {username: 'bob', publicKey: 'pubKey'};
        },
    });

    sig.createSignature({sessionToken: 'token'});
    const data = JSON.stringify({
        sessionToken : 'token',
        msg          : 'SIGNAL_AUTH_REQUEST',
        username     : 'bob',
        publicKey    : 'pubKey',
    });

    t.equal(req.calledWith('models/Encryption', 'sign', {data}), true,
        'signs the auth data');

    sand.restore();
    t.end();
});

test('models/Signal: sendInvite()', t => {
    const sig  = new Signal();
    sig.socket = {emit: sand.stub()};
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve('sign'));

    Object.defineProperty(sig, 'user', {
        get: () => {
            return {username: 'bob'};
        },
    });
    const data = JSON.stringify({
        fingerprint : 'print',
        from        : 'bob',
        to          : 'alice',
    });

    const res = sig.sendInvite({username: 'alice', fingerprint: 'print'});
    t.equal(req.calledWith('models/Encryption', 'sign', {data}), true,
        'msg');

    res.then(()  => {
        t.equal(sig.socket.emit.calledWith('sendInvite', {
            username  : 'alice',
            signature : 'sign',
        }), true, 'sends the invite');

        sand.restore();
        t.end();
    });
});

test('models/Signal: removeInvite()', t => {
    const sig  = new Signal();
    sig.socket = {emit: sand.stub()};

    sig.removeInvite({username: 'alice'});
    t.equal(sig.socket.emit.calledWith('removeInvite', {username: 'alice'}),
        true, 'emits "removeInvite"');

    t.end();
});

test('models/Signal: onInvite()', t => {
    const sig  = new Signal();
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());
    const data = {user: {username: 'alice'}, signature: 'sign'};

    sig.onInvite(data);
    t.equal(req.calledWith('collections/Users', 'saveInvite', data), true,
        'saves the invite');

    sand.restore();
    t.end();
});

test('models/Signal: after()', t => {
    Radio.channel('models/Signal').stopReplying();
    Radio.channel('collections/Configs').stopReplying();
    sand.restore();
    t.end();
});
