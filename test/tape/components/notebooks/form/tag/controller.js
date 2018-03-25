/**
 * Test components/notebooks/form/tag/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../../app/scripts/utils/underscore';
import Tag from '../../../../../../app/scripts/models/Tag';
import Controller from '../../../../../../app/scripts/components/notebooks/form/tag/Controller';
/* eslint-enable */

let sand;
test('notebooks/form/tag/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notebooks/form/tag/Controller: onDestroy()', t => {
    const con = new Controller();
    sand.stub(con, 'redirect');

    con.destroy();
    t.equal(con.redirect.called, true, 'calls redirect method');

    sand.restore();
    t.end();
});

test('notebooks/form/tag/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetch').returns(Promise.resolve({id: '1'}));
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.fetch.called, true, 'fetches the tag model');
        t.equal(con.show.calledWith({id: '1'}), true, 'renders the form view');
        t.equal(con.listenToEvents.called, true, 'starts listening to events');
        sand.restore();
        t.end();
    });
});

test('notebooks/form/tag/Controller: fetch()', t => {
    const opt = {id: '1'};
    const con = new Controller(opt);
    const req = sand.stub(Radio, 'request');

    con.fetch();
    t.equal(req.calledWith('collections/Tags', 'findModel', opt), true,
        'makes findModel request');

    sand.restore();
    t.end();
});

test('notebooks/form/tag/Controller: show()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');

    con.show({id: '1'});
    t.equal(req.calledWith('Layout', 'show', {region: 'modal', view: con.view}),
        true, 'renders the view');

    sand.restore();
    t.end();
});

test('notebooks/form/tag/Controller: listenToEvents()', t => {
    const con    = new Controller();
    con.view     = {el: 'test'};
    const listen = sand.stub(con, 'listenTo');

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'listens to destroy event');
    t.equal(listen.calledWith(con.view, 'save', con.save), true,
        'listens to save event');
    t.equal(listen.calledWith(con.view, 'cancel', con.cancel), true,
        'listens to cancel event');

    sand.restore();
    t.end();
});

test('notebooks/form/tag/Controller: save()', t => {
    const con  = new Controller();
    const trim = sand.stub().returns('test');
    con.view   = {
        destroy : sand.stub(),
        model   : new Tag({id: '1'}),
        ui      : {name: {val: sand.stub().returns({trim})}},
    };
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());

    const res = con.save();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(req.calledWith('collections/Tags', 'saveModel', {
        data  : {name           : 'test'},
        model : con.view.model,
    }), true, 'makes saveModel request');

    res.then(() => {
        t.equal(con.view.destroy.called, true, 'destroyes the view');
        sand.restore();
        t.end();
    });
});

test('notebooks/form/tag/Controller: cancel()', t => {
    const con = new Controller();
    con.view  = {destroy: sand.stub()};

    con.cancel();
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});

test('notebooks/form/tag/Controller: redirect()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');

    con.redirect();
    t.equal(req.calledWith('utils/Url', 'navigate', {
        trigger        : false,
        url            : '/notebooks',
    }), true, 'navigates to notebooks page');

    sand.restore();
    t.end();
});
