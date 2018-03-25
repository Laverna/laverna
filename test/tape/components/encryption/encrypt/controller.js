/**
 * Test components/encryption/encrypt/Controller
 * @file
 */
import test from 'tape';
import _ from 'underscore';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../../app/scripts/utils/underscore';

/* eslint-disable */
import Controller from '../../../../../app/scripts/components/encryption/encrypt/Controller';
import View from '../../../../../app/scripts/components/encryption/encrypt/View';
import Notes from '../../../../../app/scripts/collections/Notes';
/* eslint-enable */

let sand;
test('encryption/encrypt/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('encryption/encrypt/Controller: configs', t => {
    const req = sand.stub(Radio, 'request').returns({configs: 'test'});
    t.deepEqual(Controller.prototype.configs, {configs: 'test'});
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'requests configs from "configs" collection');

    sand.restore();
    t.end();
});

test('encryption/encrypt/Controller: collectionNames', t => {
    const names = new Controller().collectionNames;

    t.equal(_.isArray(names), true, 'is an array');
    t.equal(names.length, 5, 'contains 5 collection names');

    t.end();
});

test('encryption/encrypt/Controller: onDestroy()', t => {
    const con = new Controller();
    con.view  = {destroy: sand.stub()};
    sand.spy(con, 'onDestroy');

    con.destroy();
    t.equal(con.onDestroy.called, true, 'calls "onDestroy" method');
    t.equal(con.view.destroy.notCalled, true,
        'does not destroy the view if promise property is undefined');

    const con2   = new Controller();
    con2.view    = {destroy: sand.stub()};
    con2.promise = {resolve: sand.stub()};

    con2.destroy();
    t.equal(con2.view.destroy.called, true, 'destroyes the view');
    t.equal(con2.promise.resolve.called, true, 'resolves the promise');

    sand.restore();
    t.end();
});

test('encryption/encrypt/Controller: init()', t => {
    const con  = new Controller();
    const conf = {encryptBackup: {}};
    Object.defineProperty(con, 'configs', {get: () => conf});

    sand.stub(con, 'destroy');
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    t.equal(typeof con.init().then, 'function', 'returns a promise');
    t.equal(con.destroy.called, true,
        'destroyes itself if the encryption backup is empty');

    conf.encryptBackup = {encrypt: 1};
    t.equal(typeof con.init().then, 'function', 'returns a promise');
    t.equal(typeof con.promise.resolve, 'function', 'creates "promise" property');
    t.equal(con.show.called, true, 'renders the view');
    t.equal(con.listenToEvents.called, true, 'starts listening to events');

    sand.restore();
    t.end();
});

test('encryption/encrypt/Controller: show()', t => {
    const req = sand.stub(Radio, 'request');
    const con = new Controller();

    con.show();
    t.equal(req.calledWith('Layout', 'show', {region: 'brand', view: con.view}),
        true, 'renders the view');

    sand.restore();
    t.end();
});

test('encryption/encrypt/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    con.show();

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'proceed', con.proceed), true,
        'listens to "proceed" event');

    sand.restore();
    t.end();
});

test('encryption/encrypt/Controller: listenToEvents()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').resolves();

    t.equal(typeof con.resetBackup().then, 'function', 'returns a promise');
    t.equal(req.calledWith('collections/Configs', 'saveConfig', {
        config: {name: 'encryptBackup', value: {}},
    }), true, 'saves an empty encryption backup');

    sand.restore();
    t.end();
});

test('encryption/encrypt/Controller: proceed()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').resolves('collection');
    con.view  = {showProgress: sand.stub()};
    sand.stub(con, 'destroy');
    sand.stub(con, 'saveCollection').resolves();
    sand.stub(con, 'resetBackup').resolves();

    const res = con.proceed();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(con.view.showProgress.called, true, 'shows the progress bar');

    res.then(() => {
        t.equal(req.callCount, con.collectionNames.length, 'fetches all collections');
        t.equal(req.calledWith('collections/Notes', 'find', {perPage: 0}), true,
            'fetches data');

        t.equal(con.saveCollection.callCount, con.collectionNames.length,
            'saves all collections');
        t.equal(con.saveCollection.calledWith('collection'), true, 'saves a collection');

        t.equal(con.resetBackup.called, true, 'resets encryption backup settings');
        setTimeout(() => {
            t.equal(con.destroy.called, true, 'destroyes itself');
            sand.restore();
            t.end();
        }, 350);
    });
});

test('encryption/encrypt/Controller: saveCollection()', t => {
    const con  = new Controller();
    con.view   = {changeProgress: sand.stub()};
    const conf = {encrypt: 1};
    Object.defineProperty(con, 'configs', {get: () => conf});

    const col = new Notes([
        {id: '1', encryptedData: '--'},
        {id: '2', encryptedData: '--'},
    ]);
    const req = sand.stub(col.channel, 'request').resolves();

    con.saveCollection(col, 1)
    .then(() => {
        col.each(model => {
            t.equal(model.get('encryptedData'), '--',
                'does not remove "encryptedData" attribute');
            t.equal(req.calledWith('saveModel', {model}), true, 'saves the model');
        });

        t.equal(con.view.changeProgress.calledWith({
            count : 1,
            max   : con.collectionNames.length,
        }), true, 'changes the progress bar');

        conf.encrypt = 0;
        return con.saveCollection(col, 1);
    })
    .then(() => {
        col.each(model => {
            t.equal(model.get('encryptedData'), '',
                'removes "encryptedData" attribute');
        });

        sand.restore();
        t.end();
    });
});
