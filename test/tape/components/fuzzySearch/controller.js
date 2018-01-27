/**
 * Test components/fuzzySearch/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import Controller from '../../../../app/scripts/components/fuzzySearch/Controller';
import Notes from '../../../../app/scripts/collections/Notes';

let sand;
test('fuzzySearch/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('fuzzySearch/Controller: formChannel', t => {
    t.equal(Controller.prototype.formChannel.channelName, 'components/navbar');

    sand.restore();
    t.end();
});

test('fuzzySearch/Controller: onDestroy()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');

    con.destroy();
    t.equal(req.calledWith('Layout', 'empty', {region: 'fuzzySearch'}), true,
        'empties fuzzySearch region');

    sand.restore();
    t.end();
});

test('fuzzySearch/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetch').returns(Promise.resolve(2));
    sand.stub(con, 'onFetch');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(typeof con.wait.then, 'function', 'saves the promise to "wait" property');
    t.equal(con.fetch.called, true, 'fetches notes');
    t.equal(con.listenToEvents.called, true, 'starts listening to events');

    res.then(() => {
        t.equal(con.onFetch.called, true, 'calls "onFetch" method');

        sand.restore();
        t.end();
    });
});

test('fuzzySearch/Controller: fetch()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').returns(Promise.resolve());

    t.equal(typeof con.fetch().then, 'function', 'returns a promise');
    t.equal(req.calledWith('collections/Notes', 'find'), true, 'makes "find" request');

    sand.restore();
    t.end();
});

test('fuzzySearch/Controller: onFetch()', t => {
    const con    = new Controller();
    const notes  = new Notes();
    const listen = sand.stub(con, 'listenTo');

    con.onFetch(notes);
    t.equal(con.waitIsResolved, true,
        'changes the value of "waitIsResolved" property to true');
    t.equal(con.collection, notes, 'creates "collection" property');

    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'childview:navigate:search', con.navigate),
        true, 'navigates to a note page if a child view triggers navigate:search');

    sand.restore();
    t.end();
});

test('fuzzySearch/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');

    con.listenToEvents();
    t.equal(listen.calledWith(con.formChannel, 'change:search', con.search), true,
        'starts searching on change:search event');
    t.equal(listen.calledWith(con.formChannel, 'hidden:search'), true,
        'destroyes the view on hidden:search event');

    sand.restore();
    t.end();
});

test('fuzzySearch/Controller: search()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    con.wait  = Promise.resolve((con.waitIsResolved = true));
    con.view  = {isRendered: sand.stub().returns(false)};
    con.collection = {reset: sand.stub(), fuzzySearch: sand.stub().returns([1])};

    con.search({query: 'test'});
    t.equal(con.collection.fuzzySearch.calledWith('test'), true,
        'calls "fuzzySearch" method');
    t.equal(con.collection.reset.calledWith([1]), true,
        'resets the collection with fuzzy search results');

    t.equal(req.calledWith('Layout', 'show', {
        region: 'fuzzySearch',
        view  : con.view,
    }), true, 'renders the view');

    sand.restore();
    t.end();
});

test('fuzzySearch/Controller: navigate()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    con.view  = {destroy: sand.stub()};

    con.navigate({model: new Notes.prototype.model({title: 'test', id: '1'})});
    t.equal(req.calledWith('utils/Url', 'navigate', {
        filterArgs : {filter: 'search', query: 'test'},
        id         : '1',
    }), true, 'makes navigate request');

    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});
