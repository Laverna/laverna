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
    const req = sand.stub(Radio, 'request').returns({encrypt: 0});
    const con = new Controller();

    sand.stub(con, 'destroy');
    con.init();
    t.equal(con.destroy.called, true, 'destroyes itself if encryption is disabled');

    req.returns({encrypt: 1});
    sand.stub(con, 'show', () => con.promise.resolve());
    sand.stub(con, 'listenToEvents');

    con.init()
    .then(() => {
        t.equal(con.show.called, true, 'renders the view');
        t.equal(con.listenToEvents.called, true, 'starts listening to events');

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
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'submit', con.onSubmit), true,
        'listens to "submit" event');

    sand.restore();
    t.end();
});

test('encryption/auth/Controller: onSubmit()', t => {
    const con     = new Controller();
    con.view      = {ui: {password: {val: () => 'test'}}};
    const configs = {privateKey: 'priv', publicKeys: 'pub'};
    Object.defineProperty(con, 'configs', {get: () => configs});

    const req = sand.stub(Radio, 'request').returns(Promise.resolve());
    sand.stub(con, 'onSuccess');

    const res = con.onSubmit();
    t.equal(req.calledWith('models/Encryption', 'readKeys', {
        passphrase: 'test',
        privateKey: 'priv',
        publicKeys: 'pub',
    }), true, 'msg');

    res.then(() => {
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
