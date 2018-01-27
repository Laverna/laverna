/**
 * Test components/notebooks/list/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import Notebooks from '../../../../../app/scripts/collections/Notebooks';
import Tags from '../../../../../app/scripts/collections/Tags';
import Controller from '../../../../../app/scripts/components/notebooks/list/Controller';
import View from '../../../../../app/scripts/components/notebooks/list/views/Layout';
import _ from '../../../../../app/scripts/utils/underscore';
/* eslint-enable */

let sand;
test('notebooks/list/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notebooks/list/Controller: configs', t => {
    const stub = sand.stub().returns({pagination: 10});
    Radio.replyOnce('collections/Configs', 'findConfigs', stub);
    t.deepEqual(Controller.prototype.configs, {pagination: 10},
        'requests configs');
    t.end();
});

test('notebooks/list/Controller: onDestroy()', t => {
    const con       = new Controller();
    const notebooks = {removeEvents: sand.stub()};
    const tags      = {removeEvents: sand.stub()};
    con.view        = {options: {notebooks, tags}};

    con.destroy();
    t.equal(notebooks.removeEvents.called, true,
        'stops listening to notebooks collection events');
    t.equal(tags.removeEvents.called, true,
        'stops listening to tags collection events');

    sand.restore();
    t.end();
});

test('notebooks/list/Controller: init()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    sand.stub(con, 'fetch').returns(Promise.resolve([1, 2]));
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(req.calledWith('Layout', 'showLoader', {region: 'sidebar'}), true,
        'shows a loader');
    t.equal(con.fetch.called, true, 'fetches all collections');

    res.then(() => {
        t.equal(con.show.calledWith(1, 2), true, 'renders the view');
        t.equal(con.listenToEvents.called, true, 'starts listening to events');

        sand.restore();
        t.end();
    });
});

test('notebooks/list/Controller: fetch()', t => {
    const opt = {conditions: {trash: 0}};
    const con = new Controller(opt);
    const req = sand.stub(Radio, 'request');

    con.fetch();
    t.equal(req.calledWith('collections/Notebooks', 'find', opt), true,
        'fetches notebooks');
    t.equal(req.calledWith('collections/Tags', 'find', opt), true,
        'fetches tags');

    sand.restore();
    t.end();
});

test('notebooks/list/Controller: show()', t => {
    const con       = new Controller();
    const tags      = new Tags();
    const notebooks = new Notebooks();
    const req       = sand.stub(Radio, 'request');
    sand.stub(_, 'i18n').callsFake(str => str);

    sand.stub(View.prototype, 'bindKeys');
    con.show(tags, notebooks);
    t.equal(con.view instanceof View, true, 'instantiates the view');

    t.equal(req.calledWith('Layout', 'empty', {region: 'content'}), true,
        'empties "content" region');

    t.equal(req.calledWith('Layout', 'show', {
        region : 'sidebar',
        view   : con.view,
    }), true, 'renders the view');

    t.equal(req.calledWith('components/navbar', 'show', {
        section: 'Notebooks & tags',
    }), true, 'shows the navbar');

    sand.restore();
    t.end();
});

test('notebooks/list/Controller: listenToEvents()', t => {
    const con       = new Controller();
    const notebooks = {startListening: sand.stub()};
    const tags      = {startListening: sand.stub()};
    con.view        = {el: 'test', options: {notebooks, tags}};
    const listen    = sand.stub(con, 'listenTo');

    con.listenToEvents();

    t.equal(notebooks.startListening.called, true,
        'starts listening to notebooks pagination events');

    t.equal(tags.startListening.called, true,
        'starts listening to tags pagination events');

    const keyChannel = Radio.channel('utils/Keybindings');
    t.equal(listen.calledWith(keyChannel, 'appCreateNote', con.onCreateKeybinding), true,
        'shows notebook form on "c" keybinding');

    const navChannel = Radio.channel('components/navbar');
    t.equal(listen.calledWith(navChannel, 'show:form', con.navigateForm), true,
        'shows notebook form if add button in the navbar is clicked');

    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');

    sand.restore();
    t.end();
});

test('notebooks/list/Controller: onCreateKeybinding()', t => {
    const con = new Controller();
    sand.stub(con, 'navigateForm');

    con.view  = {activeRegion: 'notebooks'};
    con.onCreateKeybinding();
    t.equal(con.navigateForm.calledWith({url: '/notebooks/add'}), true,
        'navigates to notebook form page if notebooks region is active');

    con.view  = {activeRegion: 'tags'};
    con.onCreateKeybinding();
    t.equal(con.navigateForm.calledWith({url: '/tags/add'}), true,
        'navigates to tag form page if tags region is active');

    sand.restore();
    t.end();
});

test('notebooks/list/Controller: navigateForm()', t => {
    const con = new Controller();
    con.view  = {activeRegion: 'notebooks'};
    const req = sand.stub(Radio, 'request');

    con.navigateForm();
    t.equal(req.calledWith('utils/Url', 'navigate', {
        url            : '/notebooks/add',
    }), true, 'navigates to notebook form page');

    con.navigateForm({url: '/tags/add'});
    t.equal(req.calledWith('utils/Url', 'navigate', {
        url            : '/tags/add',
    }), true, 'navigates to tag form page');

    sand.restore();
    t.end();
});
