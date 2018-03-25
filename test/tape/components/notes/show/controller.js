/**
 * Test: components/notes/show/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Note from '../../../../../app/scripts/models/Note';
import Controller from '../../../../../app/scripts/components/notes/show/Controller';
import View from '../../../../../app/scripts/components/notes/show/View';
import _ from '../../../../../app/scripts/utils/underscore';

let sand;
test('notes/show/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/show/Controller: configs', t => {
    const request = sand.stub(Radio, 'request').returns({test: '1'});
    t.equal(typeof Controller.prototype.configs, 'object', 'msg');
    t.equal(request.calledWith('collections/Configs', 'findConfigs'), true,
        'requests the configs');

    sand.restore();
    t.end();
});

test('notes/show/Controller: init()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    sand.stub(con, 'fetch').returns(Promise.resolve({id: '1'}));
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(con.fetch.called, true, 'fetches the model');
    t.equal(req.calledWith('Layout', 'showLoader', {region: 'content'}), true,
        'renders the loader view to indicate that the note model is being fetched');

    res.then(() => {
        t.equal(con.show.calledWithMatch({id: '1'}), true,
            'renders the view');
        t.equal(con.listenToEvents.calledAfter(con.show), true,
            'starts listening to events');

        sand.restore();
        t.end();
    });
});

test('notes/show/Controller: fetch()', t => {
    const con     = new Controller({test: '1'});
    const request = sand.stub(Radio, 'request').returns(Promise.resolve());

    const res = con.fetch();
    t.equal(typeof res.then, 'function', 'returns a promise');

    t.equal(request.calledWithMatch('collections/Notes', 'findModel', {
        findAttachments : true,
        test            : '1',
    }), true, 'makes a "findModel" request');

    sand.restore();
    t.end();
});

test('notes/show/Controller: show()', t => {
    const con     = new Controller({test: '1'});
    const request = sand.stub(Radio, 'request');
    const trigger = sand.stub(Radio, 'trigger');
    sand.stub(View.prototype, 'initialize');

    con.show(new Note({title: 'Test'}));

    t.equal(typeof con.view, 'object', 'creates a view instance');
    t.equal(con.view instanceof View, true, 'uses the correct view');
    t.equal(request.calledWith('Layout', 'show', {
        region : 'content',
        view   : con.view,
    }), true, 'renders the view');

    t.equal(request.calledWith('utils/Title', 'set', {title: 'Test'}), true,
        'sets document title');
    t.equal(trigger.calledWith('components/notes', 'model:active', {
        model: con.view.model,
    }), true, 'triggers model:active event');

    sand.restore();
    t.end();
});

test('notes/show/Controller: listenToEvents()', t => {
    const con    = new Controller({id: '1'});
    const listen = sand.stub(con, 'listenTo');
    con.view     = {test: 'view'};

    con.listenToEvents();

    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'listens to "destroy" event');

    const channel = Radio.channel('collections/Notes');
    t.equal(listen.calledWith(channel, 'destroy:model', con.onModelDestroy), true,
        'listens to "destroy:model" event');
    t.equal(listen.calledWith(channel, 'save:object:1', con.onSaveObject), true,
        'listens to "save:object:1" event');

    t.equal(listen.calledWith(con.view, 'toggle:task', con.toggleTask), true,
        'listens to "toggle:task" event');
    t.equal(listen.calledWith(con.view, 'restore:model', con.restoreModel), true,
        'listens to "restore:model" event');

    sand.restore();
    t.end();
});

test('notes/show/Controller: onModelDestroy()', t => {
    const con = new Controller({id: '1'});
    con.view  = {model: {id: '1'}};
    sand.spy(con, 'destroy');

    con.onModelDestroy({model: {id: '2'}});
    t.equal(con.destroy.notCalled, true,
        'does nothing if the ID of the model is different');

    con.onModelDestroy({model: {id: '1'}});
    t.equal(con.destroy.called, true, 'destroys itself');

    sand.restore();
    t.end();
});

test('notes/show/Controller: onSaveObject()', t => {
    const con      = new Controller();
    con.view       = {model: new Note({id: '1'})};
    const modelNew = {
        notebook    : {id: '2'},
        fileModels  : [{id: '1'}],
        htmlContent : 'html content',
        attributes  : {title: 'Test'},
    };
    const fetch = sand.stub(con, 'fetch').returns(Promise.resolve(modelNew));
    const set   = sand.spy(con.view.model, 'set');
    sand.stub(con.view.model, 'trigger');

    const res = con.onSaveObject();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(fetch.called, true, 'fetches the model again');

    res.then(() => {
        t.equal(con.view.model.htmlContent, modelNew.htmlContent,
            'updates htmlContent property');
        t.equal(set.calledWith(modelNew.attributes), true, 'sets new attributes');
        t.equal(con.view.model.trigger.calledWith('synced'), true,
            'triggers "synced" event');

        sand.restore();
        t.end();
    });
});

test('notes/show/Controller: toggleTask()', async t => {
    const con = new Controller();
    con.view  = {model: new Note({id: '1', content: 'Test'})};

    const result  = {
        content       : 'Test',
        title         : 'Test',
        taskCompleted : 1,
        taskAll       : 2,
    };
    const request = sand.stub(Radio, 'request').resolves(result);

    const res = await con.toggleTask({taskId: 1});

    t.equal(request.calledWithMatch('markdown', 'toggleTask', {
        taskId  : 1,
        content : con.view.model.get('content'),
    }), true, 'makes toggleTask request');

    t.equal(request.calledWithMatch('collections/Notes', 'saveModel', {
        model : con.view.model,
        data  : _.pick(result, 'content', 'taskCompleted', 'taskAll'),
    }), true, 'saves the model');

    sand.restore();
    t.end();
});

test('notes/show/Controller: restoreModel()', t => {
    const con     = new Controller();
    const request = sand.stub(Radio, 'request').returns(Promise.resolve());
    con.view      = {model: new Note({id: '1'})};

    const res = con.restoreModel();
    t.equal(typeof res.then, 'function', 'returns a promise');

    t.equal(request.calledWith('collections/Notes', 'restore', {
        model: con.view.model,
    }), true, 'makes "restore" request');

    sand.restore();
    t.end();
});
