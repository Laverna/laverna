/**
 * Test components/encryption/auth/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../../app/scripts/utils/underscore';

import Controller from '../../../../../app/scripts/components/encryption/auth/Controller';
import View from '../../../../../app/scripts/components/encryption/auth/View';
import Profiles from '../../../../../app/scripts/collections/Profiles';

let sand;
test('encryption/auth/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('encryption/auth/Controller: configs', t => {
    const req = sand.stub(Radio, 'request').returns({configs: 'test'});
    t.deepEqual(Controller.prototype.configs, {configs: 'test'});
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'requests configs from "configs" collection');

    sand.restore();
    t.end();
});

test('encryption/auth/Controller: onDestroy()', t => {
    const con = new Controller();
    sand.spy(con, 'onDestroy');
    con.destroy();
    t.equal(con.onDestroy.called, true, 'calls "onDestroy" method');

    sand.restore();
    t.end();
});

test('encryption/auth/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetchShow').callsFake(() => Promise.resolve(con.promise.resolve()));

    con.init()
    .then(() => {
        t.equal(con.fetchShow.called, true, 'renders the view');

        sand.restore();
        t.end();
    });
});

test('encryption/auth/Controller: fetchShow()', t => {
    const con      = new Controller();
    const profiles = new Profiles();
    sand.stub(con, 'show');

    sand.stub(Radio, 'request')
    .withArgs('collections/Profiles', 'find')
    .resolves(profiles);

    con.fetchShow()
    .then(() => {
        t.equal(con.profiles, profiles, 'creates "profiles" property');
        t.equal(con.show.called, true, 'show the auth form');

        sand.restore();
        t.end();
    });
});

test('encryption/auth/Controller: show()', t => {
    const req  = sand.stub(Radio, 'request');
    const con  = new Controller();
    const trig = sand.stub(View.prototype, 'triggerMethod');

    con.show();
    t.equal(req.calledWith('Layout', 'show', {
        region : 'brand',
        view   : con.view,
    }), true, 'renders the view in "brand" region');
    t.equal(trig.calledWith('ready'), true, 'triggers "ready" event');

    sand.restore();
    t.end();
});

test('encryption/auth/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    con.view     = {el: 'test'};

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.onViewDestroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'submit', con.onSubmit), true,
        'listens to "submit" event');
    t.equal(listen.calledWith(con.view, 'setup', con.onSetup), true,
        'listens to "setup" event');

    sand.restore();
    t.end();
});

test('encryption/auth/Controller: onViewDestroy()', t => {
    const con  = new Controller();
    con.view   = new View();
    const stub = sand.stub(con, 'stopListening');

    con.onViewDestroy();
    t.equal(stub.calledWith(con.view), true, 'stops listening to events');

    sand.restore();
    t.end();
});

test('encryption/auth/Controller: onSubmit()', t => {
    const con     = new Controller();
    con.view      = {ui: {
        password: {val: () => 'test'},
        username: {val: () => 'bob'},
    }};
    const configs = {privateKey: 'priv', publicKeys: 'pub'};
    Object.defineProperty(con, 'configs', {get: () => configs});

    const req = sand.stub(Radio, 'request').returns(Promise.resolve());
    sand.stub(con, 'onSuccess');

    const res = con.onSubmit();
    t.equal(req.calledWith('collections/Profiles', 'setUser', {
        username: 'bob',
    }), true, 'sets the user');

    t.equal(req.calledWith('models/Encryption', 'readKeys', {
        passphrase: 'test',
    }), true, 'tries to decrypt the private key');

    res.then(() => {
        t.equal(req.calledWith('collections/Configs', 'find', {
            profileId: 'bob',
        }), true, 'fetches a users configs');
        t.equal(con.onSuccess.called, true, 'calls "onSuccess" method');

        con.view.triggerMethod = sand.stub();
        req.returns(Promise.reject());
        return con.onSubmit();
    })
    .then(() => {
        t.equal(con.view.triggerMethod.calledWith('auth:error'), true,
            'triggers auth:error event');

        sand.restore();
        t.end();
    });
});

test('encryption/auth/Controller: onSetup()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').resolves();
    sand.stub(con, 'fetchShow');

    con.onSetup()
    .then(() => {
        t.equal(req.calledWith('components/setup', 'start', {
            newIdentity: true,
        }), true, 'shows the "setup" form');
        t.equal(con.fetchShow.called, true, 're-renders the auth form');

        sand.restore();
        t.end();
    });
});

test('encryption/auth/Controller: onSuccess()', t => {
    const con   = new Controller();
    con.view    = {destroy: sand.stub()};
    con.promise = {resolve: sand.stub()};

    con.onSuccess();
    t.equal(con.promise.resolve.called, true, 'resolves the promise');
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});
