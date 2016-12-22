/**
 * Test components/help/firstStart/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';

/* eslint-disable */
import Configs from '../../../../../app/scripts/collections/Configs';
import Controller from '../../../../../app/scripts/components/help/firstStart/Controller';
/* eslint-enable */

let sand;
test('help/firstStart/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('help/firstStart/Controller: configsChannel', t => {
    t.equal(Controller.prototype.configsChannel.channelName, 'collections/Configs');
    t.end();
});

test('help/firstStart/Controller: encrypt', t => {
    const con = new Controller();
    const req = sand.stub(con.configsChannel, 'request').returns('1');

    t.equal(con.encrypt, true, 'returns true if encrypt config is equal to "1"');

    req.returns('0');
    t.equal(con.encrypt, false, 'returns false if encrypt config is not equal to "1"');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: firstStart', t => {
    const con = new Controller();
    const req = sand.stub(con.configsChannel, 'request').returns('1');

    t.equal(con.firstStart, true,
        'returns true if firstStart config is equal to "1"');

    req.returns('0');
    t.equal(con.firstStart, false,
        'returns false if firstStart config is not equal to "1"');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: profileId', t => {
    const req = sand.stub(Radio, 'request').returns('test');
    t.equal(Controller.prototype.profileId, 'test');
    t.equal(req.calledWith('utils/Url', 'getProfileId'), true,
        'makes getProfileId request');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: init()', t => {
    const con = new Controller();
    sand.spy(con, 'destroy');

    Object.defineProperty(con, 'firstStart', {get: () => false, configurable: true});
    con.init();
    t.equal(con.destroy.called, true,
        'does nothing if firstStart property is not "true"');

    Object.defineProperty(con, 'firstStart', {get: () => true});
    sand.stub(con, 'check').returns(Promise.resolve(true));
    sand.stub(con, 'show');

    con.init()
    .then(() => {
        t.equal(con.check.called, true, 'checks if it is indeed the first start');
        t.equal(con.show.calledWith(true), true, 'shows the view');

        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: check()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').returns(Promise.resolve([1]));
    Object.defineProperty(con, 'encrypt', {get: () => true, configurable: true});

    con.check()
    .then(res => {
        t.equal(res, false, 'resolves with false if encryption is enabled');

        Object.defineProperty(con, 'encrypt', {get: () => false});
        return con.check();
    })
    .then(res => {
        t.equal(res, false, 'returns false if fetched collections are not empty');
        req.returns(Promise.resolve([]));
        return con.check();
    })
    .then(res => {
        t.equal(res, true, 'returns true if fetched collections are empty');
        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: show()', t => {
    const con = new Controller();
    sand.stub(con, 'mark').returns(Promise.resolve());
    sand.stub(con, 'destroy');

    const req = sand.stub(Radio, 'request');
    sand.stub(con, 'listenToEvents');
    window.sessionStorage = {clear: sand.stub()};

    con.show(false)
    .then(() => {
        t.equal(con.mark.called, true, 'marks that it is not the first start');
        t.equal(con.destroy.called, true, 'destroyes itself');

        return con.show(true);
    })
    .then(() => {
        t.equal(req.calledWith('Layout', 'show', {
            region : 'modal',
            view   : con.view,
        }), true, 'renders the view in "modal" region');
        t.equal(window.sessionStorage.clear.called, true,
            'clears the session storage');

        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    con.view     = {el: 'test'};

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'save', con.save), true,
        'listens to "save" event');
    t.equal(listen.calledWith(con.view, 'import', con.import), true,
        'listens to "import" event');
    t.equal(listen.calledWith(con.view, 'download', con.download), true,
        'listens to "download" event');
    t.equal(listen.calledWith(con.view, 'destroy', con.onViewDestroy), true,
        'listens to "destroy" event');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: save()', t => {
    const con = new Controller();
    con.view  = {triggerMethod: sand.stub()};
    sand.stub(con, 'saveAccount').returns(Promise.resolve('account'));
    sand.stub(con, 'generateKeyPair');

    con.save()
    .then(() => {
        t.equal(con.view.triggerMethod.calledWith('save:before'), true,
            'triggers save:before event');
        t.equal(con.saveAccount.called, true, 'creates a new account');
        t.equal(con.generateKeyPair.calledWith('account'), true,
            'generates a new key pair');
        t.equal(con.view.triggerMethod.calledWith('save:after'), true,
            'triggers save:after event');

        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: saveAccount()', t => {
    const con = new Controller();
    con.view  = {ui: {
        email: {val: sand.stub().returns('test@example.com')},
        name : {val: sand.stub().returns('Test')},
    }};
    sand.stub(con.configsChannel, 'request').returns(Promise.resolve());

    con.saveAccount()
    .then(res => {
        t.equal(con.configsChannel.request.calledWith('saveModelObject', {
            profileId: con.profileId,
            data     : {
                name : 'account',
                value: {email: 'test@example.com', name: 'Test'},
            },
        }), true, 'msg');
        t.deepEqual(res, {email: 'test@example.com', name: 'Test'},
            'resolves with account data');

        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: generateKeyPair()', t => {
    const con  = new Controller();
    con.view   = {ui: {password: {val: sand.stub().returns('pass')}}};
    const keys = {publicKey: 'pub', privateKey: 'priv'};
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve(keys));
    sand.stub(con, 'saveKeyPair');

    const account = {name: 'Test', email: 'test@example.com'};
    con.generateKeyPair(account)
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'generateKeys', {
            passphrase: 'pass',
            userIds   : [account],
        }), true, 'generates a new key pair');

        t.equal(con.saveKeyPair.calledWith(keys), true,
            'saves the generate key pair');

        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: generateKeyPair()', t => {
    const con = new Controller();
    const req = sand.stub(con.configsChannel, 'request');
    const key = {primaryKey: {fingerprint: 'fingertest'}};
    sand.stub(openpgp.key, 'readArmored').returns({keys: [key]});

    con.saveKeyPair({publicKey: 'pub', privateKey: 'priv'});
    t.equal(req.calledWith('saveConfigs', {
        profileId: con.profileId,
        configs  : [
            {name: 'privateKey', value: 'priv'},
            {name: 'publicKeys', value: {fingertest: 'pub'}},
            {name: 'encrypt', value: 1},
        ],
    }), true, 'saves the key pair');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: saveCloud()', t => {
    const con = new Controller();
    let cloud = '';
    con.view  = {ui: {cloudStorage: {val: () => cloud}}};
    const req = sand.stub(con.configsChannel, 'request');

    const res = con.saveCloud();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(req.notCalled, true, 'does nothing if storage was not provided');

    cloud = 'test';
    con.saveCloud();
    t.equal(req.calledWith('saveModelObject', {
        profileId : con.profileId,
        data      : {value: 'test', name: 'cloudStorage'},
    }), true, 'msg');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: import()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    con.view  = {destroy: sand.stub()};

    con.import();
    t.equal(con.dontReload, true, 'creates "dontReload" property');
    t.equal(req.calledWith('utils/Url', 'navigate', {
        includeProfile : true,
        url            : '/settings/importExport',
    }), true, 'navigates to importExport page');
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: download()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').returns(Promise.resolve());
    con.view  = {destroy: sand.stub()};

    con.download()
    .then(() => {
        t.equal(req.calledWith('components/importExport', 'export'), true,
            'exports everything from Laverna');
        t.equal(con.view.destroy.called, true, 'destroyes the view');

        sand.restore();
        t.end();
    });
});

test('help/firstStart/Controller: mark()', t => {
    const con = new Controller();
    const req = sand.stub(con.configsChannel, 'request');

    con.mark();
    t.equal(req.calledWith('saveModelObject', {
        data      : {name: 'firstStart', value: '0'},
        profileId : con.profileId,
    }), true, 'changes the value of firstStart config "0"');

    sand.restore();
    t.end();
});

test('help/firstStart/Controller: onViewDestroy()', t => {
    const con = new Controller();
    sand.stub(con, 'mark').returns(Promise.resolve());
    sand.stub(con, 'destroy');
    sand.stub(window.location, 'reload');

    con.onViewDestroy()
    .then(() => {
        t.equal(con.mark.called, true, 'calls "mark" method');
        t.equal(window.location.reload.called, true,
            'reloads the page');

        con.dontReload = true;
        return con.onViewDestroy();
    })
    .then(() => {
        t.equal(con.destroy.called, true,
            'destroyes the controller if "dontReload" is equal to true');

        sand.restore();
        t.end();
    });
});
