/**
 * Test components/setup/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';

import _ from 'underscore';
import Controller from '../../../../app/scripts/components/setup/Controller';
import View from '../../../../app/scripts/components/setup/View';

let sand;
test('setup/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/Controller: configsChannel', t => {
    t.equal(Controller.prototype.configsChannel.channelName, 'collections/Configs');
    t.end();
});

test('setup/Controller: configs', t => {
    const configs = {test: '1'};
    const req     = sand.stub(Radio, 'request').returns(configs);

    t.equal(Controller.prototype.configs, configs, 'returns the result of the request');
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'makes "findConfigs" request');

    sand.restore();
    t.end();
});

test('setup/Controller: profileId', t => {
    const req = sand.stub(Radio, 'request').returns('test');

    t.equal(Controller.prototype.profileId, 'test', 'returns the result of the request');
    t.equal(req.calledWith('utils/Url', 'getProfileId'), true,
        'makes "getProfileId" request');

    sand.restore();
    t.end();
});

test('setup/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'isFirstStart').returns(false);
    sand.spy(con, 'destroy');
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    t.equal(typeof con.init().then, 'function', 'returns a promise');
    t.equal(con.destroy.called, true, 'destroyes itself if no setup is neccessary');

    con.isFirstStart.returns(true);
    t.equal(typeof con.init().then, 'function', 'returns a promise');
    t.equal(typeof con.promise.resolve, 'function', 'creates "promise" property');
    t.equal(con.show.called, true, 'renders the view');
    t.equal(con.listenToEvents.called, true, 'starts listening to events');

    sand.restore();
    t.end();
});

test('setup/Controller: isFirstStart()', t => {
    const con     = new Controller();
    const configs = {username: '', privateKey: '', publicKey: ''};
    Object.defineProperty(con, 'configs', {get: () => configs});

    t.equal(con.isFirstStart(), true, 'returns false if "username" is empty');

    configs.username = 'hello';
    t.equal(con.isFirstStart(), true, 'returns false if "privateKey" is empty');

    configs.privateKey = 'privKey';
    t.equal(con.isFirstStart(), true, 'returns false if "publicKey" is empty');

    configs.publicKey = 'pubKey';
    t.equal(con.isFirstStart(), false, 'returns true');

    t.end();
});

test('setup/Controller: show()', t => {
    const con     = new Controller();
    const req     = sand.stub(Radio, 'request');
    const trigger = sand.stub(View.prototype, 'triggerMethod');

    con.show();
    t.equal(req.calledWithMatch('Layout', 'show', {region: 'brand'}), true,
        'renders the view in "brand" region');
    t.equal(trigger.calledWith('ready'), true, 'triggers "ready" event');

    sand.restore();
    t.end();
});

test('setup/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.spy(con, 'listenTo');
    con.view     = {el: 'test'};

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.onViewDestroy), true,
        'listen to "destroy" event');
    t.equal(listen.calledWith(con.view, 'import', con.import), true,
        'listen to "import" event');
    t.equal(listen.calledWith(con.view, 'export', con.export), true,
        'listen to "export" event');
    t.equal(listen.calledWith(con.view, 'read:key', con.readKey), true,
        'listen to "read:key" event');

    t.equal(listen.calledWith(con.view, 'childview:check:user', con.checkUser), true,
        'listen to "childview:check:user" event');
    t.equal(listen.calledWith(con.view, 'childview:save', con.save), true,
        'listen to "childview:save" event');

    sand.restore();
    t.end();
});

test('setup/Controller: onViewDestroy()', t => {
    const con   = new Controller();
    con.promise = {resolve: sand.stub()};
    sand.spy(con, 'destroy');

    con.onViewDestroy();
    t.equal(con.promise.resolve.called, true, 'resolves the promise');
    t.equal(con.destroy.called, true, 'destroyes itself');

    sand.restore();
    t.end();
});

test('setup/Controller: checkUser()', t => {
    const con     = new Controller();
    const req     = sand.stub(Radio, 'request').returns(Promise.resolve({}));
    const confReq = sand.stub(con.configsChannel, 'request').returns(Promise.resolve());
    const user    = {username: 'test'};
    const trigger = sand.stub();
    con.view      = {
        showRegister: sand.stub(),
        getChildView: () => {
            return {triggerMethod: trigger};
        },
    };

    con.checkUser({username: 'test', signalServer: 'https://laverna.cc'})
    .then(() => {
        t.equal(confReq.calledWith('saveConfig', {
            config: {
                name  : 'signalServer',
                value : 'https://laverna.cc',
            },
        }), true, 'changes the signaling server address');

        t.equal(con.view.showRegister.calledWith({username: 'test'}), true,
            'shows the registration form if user does not exist on the server');

        req.returns(Promise.resolve(user));
        return con.checkUser({username: 'test'});
    })
    .then(() => {
        t.equal(trigger.calledWith('name:taken', {user}), true,
            'triggers "name:taken" event');

        sand.restore();
        t.end();
    });
});

test('setup/Controller: readKey()', t => {
    const con    = new Controller();
    const reader = {
        readAsText : () => {
            reader.onload({target: {result: 'armoredKey'}});
        },
    };
    global.FileReader = function() {
        return reader;
    };

    const trigger = sand.stub();
    con.view      = {getChildView: () => {
        return {triggerMethod: trigger};
    }};

    const read = sand.stub(openpgp.key, 'readArmored');
    const key  = {isPublic: sand.stub().returns(true)};
    read.returns({err: 'error', keys: [key]});

    con.readKey({file: 'file'})
    .then(() => {
        t.equal(read.calledWith('armoredKey'), true, 'reads the key');
        t.equal(trigger.calledWith('key:error', {
            err: 'You need to upload your private key!',
        }), true, 'triggers "key:error"');

        read.returns({error: false, keys: [key]});
        return con.readKey({file: 'file'});
    })
    .then(() => {
        t.equal(trigger.calledWith('ready:key'), false,
            'does nothing if the key is not a private key');

        key.isPublic.returns(false);
        return con.readKey({file: 'file'});
    })
    .then(() => {
        t.equal(trigger.calledWith('ready:key', {key}), true,
            'triggers "ready:key"');

        global.FileReader = null;
        sand.restore();
        t.end();
    });
});

test('setup/Controller: save()', t => {
    const con  = new Controller();
    const view = {triggerMethod: sand.stub()};
    con.view   = {getChildView: () => view, triggerMethod: sand.stub()};

    sand.stub(con, 'generateKeyPair').returns(Promise.resolve('keys'));
    sand.stub(con, 'register');
    sand.stub(con, 'saveConfigs');

    const opt = {
        username : 'test',
        keyData  : {username: 'test', passphrase: '1'},
        register : true,
    };

    con.save(_.extend({keys: 'keys'}, opt));
    t.equal(con.generateKeyPair.notCalled, true,
        'does not generate a new key pair if the key is provided');

    con.save(opt)
    .then(() => {
        t.equal(view.triggerMethod.calledWith('save:before'), true,
            'triggers "save:before"');
        t.equal(con.view.triggerMethod.calledWith('save:after', {username: 'test'}),
            true, 'triggers "save:after"');

        t.equal(con.generateKeyPair.calledWith(opt.keyData), true,
            'generates a new key pair');
        t.equal(con.register.calledWith({username: opt.username, register: true}),
            true, 'registers a new account on the signaling server');
        t.equal(con.saveConfigs.calledWith({username: opt.username}), true,
            'saves configs');

        sand.restore();
        t.end();
    });
});

test('setup/Controller: generateKeyPair()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');

    con.generateKeyPair({passphrase: '1', username: 'test'});
    t.equal(req.calledWith('models/Encryption', 'generateKeys', {
        passphrase: '1',
        userIds: [{name: 'test'}],
    }), true, 'makes "generateKeys" request');

    sand.restore();
    t.end();
});

test('setup/Controller: register()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    con.keys  = {publicKey: 'PGP PRIVATE KEY'};

    con.register({username: 'test', register: false});
    t.equal(req.notCalled, true, 'does nothing if "register" is false');

    try {
        con.register({username: 'test', register: true});
    }
    catch (e) {
        t.equal(e.message, 'Your private key will not be uploaded',
            'throws an error if it is trying to upload a private key to the server');
    }

    con.keys = {publicKey: ''};
    con.register({username: 'test', register: true});
    t.equal(req.calledWith('models/Signal', 'register', {
        username  : 'test',
        publicKey : con.keys.publicKey,
    }), true, 'registers an account on the signaling server');

    sand.restore();
    t.end();
});

test('setup/Controller: saveConfigs()', t => {
    const con = new Controller();
    const req = sand.stub(con.configsChannel, 'request');
    con.keys  = {privateKey: 'priv', publicKey: 'pub'};

    con.saveConfigs({username: 'test'});
    t.equal(req.calledWith('saveConfigs', {
        configs: [
            {name: 'privateKey', value: con.keys.privateKey},
            {name: 'publicKey', value: con.keys.publicKey},
            {name: 'encrypt', value: 1},
            {name: 'username', value: 'test'},
        ],
        profileId: con.profileId,
    }), true, 'saves configs');

    sand.restore();
    t.end();
});

test('setup/Controller: export()', t => {
    const con   = new Controller();

    sand.stub(con, 'saveSync').resolves();
    global.Blob = sand.stub().returns('blob');
    con.view    = {destroy: sand.stub()};
    con.keys    = {privateKey: 'priv'};
    sand.stub(con, 'fileSaver');

    const res = con.export();
    t.equal(con.saveSync.called, true, 'calls saveSync() method');

    res.then(() => {
        t.equal(global.Blob.calledWith([con.keys.privateKey], {
            type: 'text/plain',
        }), true, 'creates a blob of the private key');

        t.equal(con.fileSaver.calledWithMatch({}, 'laverna-key.asc'), true,
            'offers the user to save their private key');
        t.equal(con.view.destroy.called, true, 'destroyes the view');

        sand.restore();
        t.end();
    });
});

test('setup/Controller: import()', t => {
    const con = new Controller();

    con.import();
    t.end();
});
