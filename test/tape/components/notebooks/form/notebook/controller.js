/**
 * Test components/notebooks/form/notebooks/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../../app/scripts/utils/underscore';
import Notebooks from '../../../../../../app/scripts/collections/Notebooks';
import Controller from '../../../../../../app/scripts/components/notebooks/form/notebook/Controller';
import View from '../../../../../../app/scripts/components/notebooks/form/notebook/View';
/* eslint-enable */

let sand;
test('notebooks/form/notebook/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notebooks/form/notebook/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetch').returns(Promise.resolve([1, 2]));
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.show.calledWith(1, 2), true, 'calls "show" method');
        t.equal(con.listenToEvents.called, true, 'calls "listenToEvents" method');

        sand.restore();
        t.end();
    });
});

test('notebooks/form/notebook/Controller: onDestroy()', t => {
    const con = new Controller();
    con.view  = {model: {el: 'test'}};
    sand.stub(con, 'fulfillPromise');
    sand.stub(con, 'redirect');

    con.destroy();
    t.equal(con.fulfillPromise.calledWith('resolve', {model: con.view.model}), true,
        'resolves the promise');
    t.equal(con.redirect.called, true, 'navigates back');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: fetch()', t => {
    const opt = {id: '1-1'};
    const con = new Controller(opt);
    const req = sand.stub(Radio, 'request');

    const res = con.fetch();
    t.equal(typeof res.then, 'function', 'returns a promise');

    t.equal(req.calledWith('collections/Notebooks', 'find', opt), true,
        'fetches notebooks collection');
    t.equal(req.calledWith('collections/Notebooks', 'findModel', opt), true,
        'fetches the notebook model');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: show()', t => {
    const con    = new Controller();
    const reject = sand.stub(Notebooks.prototype, 'rejectTree');
    const col    = new Notebooks();
    const req    = sand.stub(Radio, 'request');

    con.show(col, new Notebooks.prototype.model({id: '1'}));
    t.equal(reject.calledWith('1'), true,
        'shows only notebooks which are not related to the current model');

    t.equal(req.calledWith('Layout', 'show', {
        region : 'modal',
        view   : con.view,
    }), true, 'renders the form view in modal region');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: listenToEvents()', t => {
    const con    = new Controller();
    con.view     = {el: 'test'};
    const listen = sand.stub(con, 'listenTo');

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'save', con.save), true,
        'saves changes');
    t.equal(listen.calledWith(con.view, 'cancel'), true, 'cancels changes');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: save()', t => {
    const con   = new Controller();
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve());
    con.view    = new View();
    con.view.ui = {
        name     : {val : sand.stub().returns({trim : () => 'test'})},
        parentId : {val : sand.stub().returns({trim : () => '0'})},
    };
    sand.stub(con, 'onSave');

    const res = con.save();
    t.equal(req.calledWith('collections/Notebooks', 'saveModel', {
        data  : {name: 'test', parentId: '0'},
        model : con.view.model,
    }), true, 'makes saveModel request');

    res.then(() => {
        t.equal(con.onSave.calledAfter(req), true,
            'calls onSave method after saving the model');

        sand.restore();
        t.end();
    });
});

test('notebooks/form/notebook/Controller: onSave()', t => {
    const con     = new Controller();
    con.view      = {destroy: sand.stub(), model: {id: '1'}};
    const fulfill = sand.stub(con, 'fulfillPromise');

    con.onSave();
    t.equal(fulfill.calledWith('resolve', {model: con.view.model}), true,
        'fulfills the promise');
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: onSaveError()', t => {
    const con     = new Controller();
    const fulfill = sand.stub(con, 'fulfillPromise');

    con.onSaveError('test');
    t.equal(fulfill.calledWith('reject', {error: 'test'}), true,
        'rejects the promise');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: fulfillPromise()', t => {
    const resolve = sand.stub();
    const reject  = sand.stub();
    const con     = new Controller({});

    con.fulfillPromise('resolve', {id: '1'});
    t.equal(resolve.notCalled, true, 'does nothing if promise does not exist');

    con.options.promise = {resolve, reject};
    con.fulfillPromise('resolve', {id: '1'});
    t.equal(resolve.called, true, 'resolves the promise');

    con.options.promise = {resolve, reject};
    con.fulfillPromise('reject', {id: '2'});
    t.equal(reject.called, true, 'rejects the promise');

    sand.restore();
    t.end();
});

test('notebooks/form/notebook/Controller: redirect()', t => {
    const con     = new Controller({});
    const req = sand.stub(Radio, 'request');
    req.withArgs('utils/Url', 'getHash').returns('/notes');

    con.redirect();
    t.equal(req.calledWith('utils/Url', 'getHash'), true,
        'requests the current document hash');
    t.equal(req.calledWith('utils/Url', 'navigate'), false,
        'does nothing if it is not notebooks page');

    req.withArgs('utils/Url', 'getHash').returns('/notebooks');
    con.redirect();
    t.equal(req.calledWith('utils/Url', 'navigate', {
        trigger        : false,
        url            : '/notebooks',
    }), true, 'does nothing if it is not notebooks page');

    sand.restore();
    t.end();
});
