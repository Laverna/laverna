/**
 * Test components/linkDialog/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import Controller from '../../../../app/scripts/components/linkDialog/Controller';

let sand;
test('linkDialog/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('linkDialog/Controller: channel', t => {
    t.equal(Controller.prototype.channel.channelName, 'components/linkDialog');
    t.end();
});

test('linkDialog/Controller: notesChannel', t => {
    t.equal(Controller.prototype.notesChannel.channelName, 'collections/Notes');
    t.end();
});

test('linkDialog/Controller: onDestroy()', t => {
    const con     = new Controller();
    const resolve = sand.stub();
    con.promise   = {resolve};

    con.destroy();
    t.equal(resolve.calledWith(null), true, 'resolves the promise');

    sand.restore();
    t.end();
});

test('linkDialog/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents').callsFake(() => con.promise.resolve());

    con.init()
    .then(() => {
        t.equal(con.show.called, true, 'calls "show" method');
        t.equal(con.listenToEvents.called, true, 'calls "listenToEvents" method');

        sand.restore();
        t.end();
    });
});

test('linkDialog/Controller: show()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    sand.stub(con, 'renderDropdown').returns(Promise.resolve());

    con.show();
    t.equal(req.calledWith('Layout', 'show', {
        region : 'modal',
        view   : con.view,
    }), true, 'renders the view');
    t.equal(con.renderDropdown.called, true, 'renders the dropdown menu');
    t.equal(typeof con.wait.then, 'function', 'waits for notes collection');

    sand.restore();
    t.end();
});

test('linkDialog/Controller: listenToEvents()', t => {
    const con  = new Controller();
    const stub = sand.stub(con, 'listenTo');

    con.listenToEvents();
    t.equal(stub.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(stub.calledWith(con.view, 'cancel'), true,
        'destroyes the view on cancel event');

    t.equal(stub.calledWith(con.view, 'save', con.resolve), true,
        'resolves the promise on "save" event');
    t.equal(stub.calledWith(con.view, 'search', con.search), true,
        'searches for notes');
    t.equal(stub.calledWith(con.view, 'create:note', con.createNote), true,
        'creates a new note on create:note event');

    sand.restore();
    t.end();
});

test('linkDialog/Controller: renderDropdown()', t => {
    const con = new Controller();
    const req = sand.stub(con.notesChannel, 'request')
    .resolves({models: []});
    con.view  = {options: {}, renderDropdown: sand.stub()};

    con.renderDropdown()
    .then(() => {
        t.equal(req.calledWith('find', {pageSize: 10}), true,
            'fetches notes collection');
        t.deepEqual(con.view.options.collection, {models: []});
        t.equal(con.view.renderDropdown.called, true, 'renders the dropdown view');

        sand.restore();
        t.end();
    });
});

test('linkDialog/Controller: resolve()', t => {
    const con     = new Controller();
    const resolve = sand.stub();
    con.promise   = {resolve};
    con.view      = {
        destroy : sand.stub(),
        ui      : {url: {val: () => '#/test'}},
    };

    con.resolve('#/note');
    t.equal(resolve.calledWith('#/note'), true, 'resolves the promise with the URL');
    t.equal(con.promise, null);
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    con.promise = {resolve};
    con.resolve();
    t.equal(resolve.calledWith('#/test'), true,
        'if url is not provided, it will get it from the input');

    sand.restore();
    t.end();
});

test('linkDialog/Controller: search()', t => {
    const con  = new Controller();
    con.wait   = Promise.resolve();
    const coll = {reset: sand.stub(), fuzzySearch: sand.stub().returns([])};
    con.view   = {
        trigger    : sand.stub(),
        options    : {collection : coll},
    };

    con.search('test')
    .then(() => {
        t.equal(con.waitIsResolved, true, 'creates waitIsResolved property');
        t.equal(coll.fuzzySearch.called, true, 'calls fuzzySearch method');
        t.equal(coll.reset.called, true, 'resets the collection');
        t.equal(con.view.trigger.calledWith('toggle:dropdown'), true,
            'triggers toggle:dropdown event');

        sand.restore();
        t.end();
    });
});

test('linkDialog/Controller: createNote()', t => {
    const con  = new Controller();
    con.view   = {ui: {url: {val: () => 'Test'}}};
    const save = sand.stub(con.notesChannel, 'request');
    save.returns(Promise.resolve({id: '1'}));
    const req  = sand.stub(Radio, 'request').returns('/note/1');
    sand.stub(con, 'resolve');

    con.createNote()
    .then(() => {
        t.equal(save.calledWith('saveModelObject', {
            data: {title: 'Test'},
        }), true, 'creates a new note');

        t.equal(req.calledWithMatch('utils/Url', 'getNoteLink', {
            model: {id: '1'},
        }), true, 'requests the note link');

        t.equal(con.resolve.calledWith('#/note/1'), true, 'resolves the promise');

        sand.restore();
        t.end();
    });
});
