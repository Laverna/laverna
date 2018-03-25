/**
 * Test components/navbar/controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Controller from '../../../../app/scripts/components/navbar/Controller';
import View from '../../../../app/scripts/components/navbar/View';

let sand;
test('navbar/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('navbar/Controller: configs', t => {
    const req = sand.stub(Radio, 'request').returns({});
    t.equal(typeof Controller.prototype.configs, 'object', 'returns an object');
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'makes findConfigs request');

    sand.restore();
    t.end();
});

test('navbar/Controller: constructor()', t => {
    const reply = sand.stub(Controller.prototype.channel, 'reply');
    const con   = new Controller();

    t.equal(reply.calledWith({
        show: con.onShowRequest,
    }), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('navbar/Controller: onShowRequest()', t => {
    const con = new Controller();
    sand.stub(con, 'changeTitle');
    sand.stub(con, 'init');

    con.onShowRequest({test: '1'});
    t.equal(con.init.calledWith({test: '1'}), true,
        'instantiates the view if it was not');
    t.equal(con.changeTitle.notCalled, true,
        'does not call changeTitle method');

    con.view = {_isRendered: true};
    con.onShowRequest({test: '1'});
    t.equal(con.changeTitle.calledWith({test: '1'}), true,
        'just changes the title if the navbar view already exists');

    sand.restore();
    t.end();
});

test('Controller: changeTitle()', t => {
    const con          = new Controller();
    const titleOptions = {section: 'Test'};
    sand.stub(con, 'changeDocumentTitle').returns(Promise.resolve(titleOptions));
    con.view           = {triggerMethod: sand.stub()};

    const res = con.changeTitle({filter: 'test'});
    t.equal(con.changeDocumentTitle.calledWith({filter: 'test'}), true,
        'changes document title');

    res.then(() => {
        t.equal(con.view.triggerMethod.calledWith('change:title', {titleOptions}), true,
            'triggers change:title event to the view');

        sand.restore();
        t.end();
    });
});

test('navbar/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetch').returns(Promise.resolve());
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(con.fetch.called, true, 'fetches data first');
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.listenToEvents.calledAfter(con.fetch), true,
            'starts listening to events');

        sand.restore();
        t.end();
    });
});

test('navbar/Controller: fetch()', t => {
    const con = new Controller({filter: 'tag'});
    sand.stub(con, 'changeDocumentTitle').returns({title: 'Test'});

    const req = sand.stub(Radio, 'request');
    req.withArgs('collections/Configs').returns({id: '1'});
    req.withArgs('collections/Notebooks').returns({id: 'id-1'});

    const res = con.fetch();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(req.calledWith('collections/Notebooks', 'find', {
            conditions : {trash  : 0},
        }), true, 'fetches notebooks collection');
        t.equal(con.changeDocumentTitle.calledWithMatch({filter: 'tag'}), true,
            'changes document title');

        t.deepEqual(con.notebooks, {id: 'id-1'}, 'creates notebooks property');
        t.deepEqual(con.options.titleOptions, {title: 'Test'},
            'saves the result of changeTitle method');

        sand.restore();
        t.end();
    });
});

test('navbar/Controller: changeDocumentTitle()', t => {
    const con = new Controller({id: '1'});
    const req = sand.stub(Radio, 'request');

    con.changeDocumentTitle();
    t.equal(req.calledWith('utils/Title', 'set', {id: '1'}), true,
        'changes the title with this.options');

    con.changeDocumentTitle({id: '2'});
    t.equal(req.calledWith('utils/Title', 'set', {id: '2'}), true,
        'changes the title with options');

    sand.restore();
    t.end();
});

test('navbar/Controller: show()', t => {
    const con = new Controller({id: '1'});
    const req = sand.stub(Radio, 'request');

    con.show();
    t.equal(con.view instanceof View, true, 'uses the right view');
    t.equal(req.calledWithMatch('Layout', 'show', {
        region: 'sidebarNavbar',
    }), true, 'renders the navbar');

    sand.restore();
    t.end();
});

test('navbar/Controller: listenToEvents()', t => {
    const con    = new Controller({id: '1'});
    con.view     = {model: 'test'};
    const listen = sand.stub(con, 'listenTo');
    con.notebooks = {startListening: sand.stub()};

    con.listenToEvents();
    t.equal(con.notebooks.startListening.called, true,
        'starts listening to notebooks collection events');
    t.equal(listen.calledWith(con.view, 'submit:search', con.navigateSearch), true,
        'navigates to search page on search:submit event');

    sand.restore();
    t.end();
});

test('navbar/Controller: navigateSearch()', t => {
    const con = new Controller({id: '1'});
    const req = sand.stub(Radio, 'request');

    con.navigateSearch({query: 'world'});
    t.equal(req.calledWith('utils/Url', 'navigate', {
        filterArgs: {query: 'world', filter: 'search'},
    }), true, 'makes navigate request');

    sand.restore();
    t.end();
});

test('navbar/Controller: after()', t => {
    Radio.channel('components/navbar').stopReplying();
    t.end();
});
