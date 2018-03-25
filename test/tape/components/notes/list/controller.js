/**
 * Test the core app: components/notes/list/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Notes from '../../../../../app/scripts/collections/Notes';
import Controller from '../../../../../app/scripts/components/notes/list/Controller.js';
import '../../../../../app/scripts/utils/underscore';

let sand;
test('notes/list/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/list/Controller: configs', t => {
    const stub = sand.stub().returns({pagination: 10});
    Radio.replyOnce('collections/Configs', 'findConfigs', stub);
    t.deepEqual(Controller.prototype.configs, {pagination: 10},
        'requests configs');
    t.end();
});

test('notes/list/Controller: init()', t => {
    const con   = new Controller({filterArgs: {filter: 'tag'}});
    const notes = new Notes([
        {id: '1', title: 'Test 1'},
        {id: '2', title: 'Test 2'},
    ]);
    const find = sand.stub().returns(Promise.resolve(notes));
    Radio.replyOnce('collections/Notes', 'find', find);
    const show   = sand.stub(con, 'show');
    const listen = sand.stub(con, 'listenToEvents');

    Object.defineProperty(con, 'configs', {get: () => {
        return {pagination: 10};
    }});

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(find.calledWith({perPage: 10, filter: 'tag'}), true,
        'requests notes collection');

    res.then(() => {
        t.equal(show.calledAfter(find), true, 'renders the view');
        t.equal(show.calledWith(notes), true,
            'calls show method after fetching notes collection');
        t.equal(listen.calledAfter(show), true,
            'starts listening to events after rendering the view');

        sand.restore();
        t.end();
    });
});

test('notes/list/Controller/Controller: onDestroy()', t => {
    const con = new Controller();
    con.view  = {collection: {removeEvents: sand.stub()}};

    con.destroy();
    t.equal(con.view.collection.removeEvents.called, true,
        'stops listening to collection events');

    t.end();
});

test('notes/list/Controller: show()', t => {
    const con        = new Controller({});
    const collection = new Notes();

    const request = sand.stub(Radio, 'request');

    con.show(collection);
    t.equal(request.calledWithMatch('Layout', 'show', {region: 'sidebar'}), true,
        'renders the view in "sidebar" region');
    t.equal(request.calledWith('components/navbar', 'show'), true,
        'makes "show" request to components/navbar channel');

    sand.restore();
    t.end();
});

test('notes/list/Controller: listenToEvents()', t => {
    const con = new Controller({});
    con.view  = {collection: new Notes()};
    sand.stub(con.view.collection, 'startListening');

    const listen = sand.stub(con, 'listenTo');
    con.listenToEvents();

    t.equal(con.view.collection.startListening.called, true,
        'starts listening collection events');

    const key = listen.calledWith(
        Radio.channel('utils/Keybindings'),
        'appCreateNote',
        con.navigateForm
    );
    t.equal(key, true, 'listens to "appCreateNote" event from keybindgins channel');

    const navbarForm = listen.calledWith(Radio.channel('components/navbar'),
        'show:form', con.navigateForm);
    t.equal(navbarForm, true, 'shows the form on show:form event');

    const col = listen.calledWith(con.view.collection.channel, 'model:navigate');
    t.equal(col, true, 'listens to "model:navigate" event on collection channel');

    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroys itself if the view is destroyed');

    sand.restore();
    t.end();
});

test('notes/list/Controller: navigateModel()', t => {
    const con     = new Controller({filterArgs: {ok: true}});
    const model   = new Notes.prototype.model();
    const request = sand.stub(Radio, 'request');

    con.navigateModel({model});

    t.equal(request.calledWith('utils/Url', 'navigate', {
        trigger    : false,
        filterArgs : con.options.filterArgs,
    }), true, 'navigates to the list of notes');

    t.equal(request.calledWith('utils/Url', 'navigate', {
        model,
        filterArgs : con.options.filterArgs,
    }), true, 'navigates to the note');

    sand.restore();
    t.end();
});

test('notes/list/Controller: navigateForm()', t => {
    const con     = new Controller({filterArgs: {ok: true}});
    const request = sand.stub(Radio, 'request');

    con.navigateForm();
    t.equal(request.calledWith('utils/Url', 'navigate', {
        url : 'notes/add',
    }), true, 'msg');

    sand.restore();
    t.end();
});
