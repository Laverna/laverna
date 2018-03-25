/**
 * Test: components/notes/form/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../../app/scripts/utils/underscore';
import Note from '../../../../../app/scripts/models/Note';

// Fix mousetrap bug
const Mousetrap     = require('mousetrap');
global.Mousetrap    = Mousetrap;

// eslint-disable-next-line
const Controller = require('../../../../../app/scripts/components/notes/form/Controller').default;
const View       = require('../../../../../app/scripts/components/notes/form/views/Form').default;

let sand;
test('notes/form/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/form/Controller: configs', t => {
    const stub = sand.stub().returns({pagination: 10});
    Radio.replyOnce('collections/Configs', 'findConfigs', stub);
    t.deepEqual(Controller.prototype.configs, {pagination: 10},
        'requests configs');
    t.end();
});

test('notes/form/Controller: notesChannel', t => {
    t.equal(Controller.prototype.notesChannel.channelName, 'collections/Notes');
    t.end();
});

test('notes/form/Controller: ignoreKeys', t => {
    t.deepEqual(Controller.prototype.ignoreKeys.length, 3);
    t.deepEqual(Controller.prototype.ignoreKeys, ['created', 'updated', 'encryptedData']);
    t.end();
});

test('notes/form/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetch').returns(Promise.resolve([1, 2]));
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.fetch.called, true, 'fetches the model');
        t.equal(con.show.calledAfter(con.fetch), true, 'renders the view');
        t.equal(con.listenToEvents.calledAfter(con.show), true,
            'starts listening to events');

        sand.restore();
        t.end();
    });
});

test('notes/form/Controller: onDestroy()', t => {
    const con = new Controller();
    sand.spy(con, 'onDestroy');

    con.destroy();
    t.equal(con.onDestroy.called, true);

    sand.restore();
    t.end();
});

test('notes/form/Controller: fetch()', async t => {
    const con     = new Controller({id: '1'});
    const req     = sand.stub(Radio, 'request');
    const noteReq = sand.stub(con.notesChannel, 'request').resolves();

    await con.fetch();
    t.equal(noteReq.calledWith('findModel', {
        id              : '1',
        findAttachments : true,
    }), true, 'makes "findModel" request to notes collection');

    t.equal(req.calledWithMatch('collections/Notebooks', 'find'),
        true, 'makes "find" request to notebooks collection');

    sand.restore();
    t.end();
});

test('notes/form/Controller: show()', t => {
    const con     = new Controller({profileId: 'testdb'});
    con.model     = new Note({title: 'Untitled', content: 'Test...'});
    con.notebooks = {};

    const req     = sand.stub(Radio, 'request');
    const trig    = sand.stub(View.prototype, 'triggerMethod');

    con.show();
    t.deepEqual(con.dataBeforeChange, _.omit(con.model.attributes, 'created', 'updated', 'encryptedData'),
        'saves model attributes to restore it later');
    t.equal(req.calledWithMatch('Layout', 'show', {region: 'content'}), true,
        'renders the view');
    t.equal(trig.calledWith('after:render'), true, 'triggers after:render event');
    t.equal(req.calledWith('utils/Title', 'set', {title: 'Untitled'}), true,
        'changes the document title');

    sand.restore();
    t.end();
});

test('notes/form/Controller: getNotebookId()', t => {
    const con = new Controller({filter: 'notebook', query: '2'});
    con.model = new Note({notebookId: '1'});

    t.equal(con.getNotebookId(), '1',
        'returns the notebook which is attached to the note model');

    con.model.set('notebookId', '0');
    t.equal(con.getNotebookId(), '2',
        'returns the notebook ID from the options');

    con.options.filter = 'tag';
    t.equal(con.getNotebookId(), '0',
        'returns 0');

    t.end();
});

test('notes/form/Controller: listenToEvents()', t => {
    const con    = new Controller({id: '1'});
    con.view     = new View();
    const listen = sand.stub(con, 'listenTo');

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroys itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'save', con.save), true,
        'saves the changes');
    t.equal(listen.calledWith(con.view, 'cancel', con.checkChanges), true,
        'checks if there are any changes before closing the form');
    t.equal(listen.calledWith(con.notesChannel, 'save:object:1', con.onSaveObject),
        true, 'listens to save:object:1');

    con.view.destroy();
    sand.restore();
    t.end();
});

test('notes/form/Controller: save()', t => {
    const con    = new Controller({});
    con.view     = new View({model: new Note()});

    const req      = sand.stub(Radio, 'request');
    const notesReq = sand.stub(con.notesChannel, 'request');
    sand.stub(con, 'getData').returns(Promise.resolve({title: 'Ok'}));
    sand.spy(con, 'checkTitle');
    sand.stub(con, 'redirect');

    const res = con.save({autoSave: true});
    t.equal(con.getData.called, true, 'gets the updated data');
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.checkTitle.calledWith({title: 'Ok'}), true,
            'checks if the title exists');
        t.equal(notesReq.calledWith('saveModel', {
            data     : {title: 'Ok'},
            saveTags : false,
            model    : con.view.model,
        }), true, 'saves the model but does not save the tags');
        t.equal(con.redirect.called, false, 'does not redirect anywhere');

        return con.save({autoSave: false});
    })
    .then(() => {
        t.equal(notesReq.calledWithMatch('saveModel', {
            saveTags : true,
        }), true, 'saves the model and tags');
        t.equal(con.redirect.calledWith(false), true, 'redirects back');

        sand.restore();
        t.end();
    });
});

test('notes/form/Controller: getData()', t => {
    const con    = new Controller({});
    con.view     = new View({model: new Note()});
    con.view.ui  = {title: {val: () => 'Title'}};
    sand.stub(con.view, 'getChildView').returns({
        ui: {notebookId: {val: () => 'Test'}},
    });

    const reply = sand.stub().returns(Promise.resolve({content: 'Test'}));
    Radio.replyOnce('components/editor', 'getData', reply);

    const res = con.getData();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(data => {
        t.deepEqual(data, {notebookId: 'Test', title: 'Title', content: 'Test'},
            'returns all data');

        sand.restore();
        t.end();
    });
});

test('notes/form/Controller: checkTitle()', t => {
    const con = new Controller({});
    const req = sand.stub(Radio, 'request');
    sand.stub(_, 'i18n').returns('Untitled');

    t.deepEqual(con.checkTitle({title: 'Test'}), {title: 'Test'});
    t.deepEqual(con.checkTitle({title: ''}), {title: 'Untitled'});

    t.equal(req.calledWith('utils/Title', 'set', {title: 'Untitled'}), true,
        'changes the document title');

    sand.restore();
    t.end();
});

test('notes/form/Controller: checkChanges()', t => {
    const con = new Controller({});
    con.model = new Note({title: 'Test', content: 'Content'});
    con.dataBeforeChange = _.omit(con.model.attributes, con.ignoreKeys);

    sand.stub(con, 'getData').returns(Promise.resolve({
        title: 'Test', content: 'Content', encryptedData: 'hello',
    }));
    sand.stub(con, 'redirect');
    sand.stub(con, 'showCancelConfirm');

    const res = con.checkChanges();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.redirect.calledWith(false), true,
            'redirect to the previous page if there are no changes');

        con.getData.returns(Promise.resolve({title: 'Test 1'}));
        return con.checkChanges();
    })
    .then(() => {
        t.equal(con.showCancelConfirm.called, true,
            'shows a confirmation dialog asking a user if it is alright to lose data');

        sand.restore();
        t.end();
    });
});

test('notes/form/Controller: onSaveObject()', async t => {
    const con         = new Controller({});
    con.view          = {model: new Note({title: 'Old'})};
    const model       = new Note({title: 'Changed title'});
    model.htmlContent = 'HTML';

    sand.stub(con, 'fetch').resolves(model);
    sand.stub(con.view.model, 'trigger');

    await con.onSaveObject();
    t.equal(con.fetch.called, true, 're-fetches the model');
    t.equal(con.view.model.htmlContent, model.htmlContent,
        'updates html content');
    t.deepEqual(con.view.model.attributes, model.attributes,
        'updates model attributes');
    t.equal(con.view.model.trigger.calledWith('synced'), true,
        'triggers "synced" event');

    sand.restore();
    t.end();
});

test('notes/form/Controller: showCancelConfirm()', t => {
    const con = new Controller({});
    sand.stub(con, 'redirect');
    sand.stub(con, 'onRejectCancel');

    const req = sand.stub(Radio, 'request').returns(Promise.resolve('confirm'));

    con.showCancelConfirm()
    .then(() => {
        t.equal(req.calledWith('components/confirm', 'show'), true,
            'shows the confirmation dialog');
        t.equal(con.redirect.called, true, 'redirects to the previous');

        req.returns(Promise.resolve('reject'));
        return con.showCancelConfirm();
    })
    .then(() => {
        t.equal(con.onRejectCancel.called, true,
            'handles the rejected confirm');

        sand.restore();
        t.end();
    });
});

test('notes/form/Controller: redirect()', t => {
    const con = new Controller({});
    con.view  = new View();
    const req = sand.stub(Radio, 'request');
    sand.stub(con, 'preRedirect').returns(Promise.resolve());
    sand.spy(con.view, 'destroy');

    const res = con.redirect(false);
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.preRedirect.notCalled, true,
            'does not call preRedirect method if the first argument is equal to false');
        t.equal(req.calledWith('utils/Url', 'navigateBack'), true,
            'makes "navigateBack" request');
        t.equal(con.view.destroy.called, true, 'destroys the view');

        return con.redirect();
    })
    .then(() => {
        t.equal(con.preRedirect.called, true,
            'calls preRedirect method');
        t.equal(req.calledAfter(con.preRedirect), true,
            'makes "navigateBack" after calling preRedirect method');

        sand.restore();
        t.end();
    });
});

test('notes/form/Controller: preRedirect()', t => {
    const con      = new Controller({});
    con.model      = new Note();
    const req      = sand.stub(Radio, 'request').returns(Promise.resolve());
    const notesReq = sand.stub(con.notesChannel, 'request').returns(Promise.resolve());
    sand.stub(con.model, 'set');

    t.equal(typeof con.preRedirect().then, 'function', 'returns a promise');
    t.equal(con.model.set.calledWith({title: 'Untitled'}), true,
        'changes the title to "Untitled"');
    t.equal(req.calledWith('components/notes', 'remove', {
        model : con.model,
        force : true,
    }), true, 'removes the model if it is a new note');

    con.options.id       = '1';
    con.dataBeforeChange = {title: 'Test 1', content: 'Test content'};
    t.equal(typeof con.preRedirect().then, 'function', 'returns a promise');
    t.equal(notesReq.calledWith('saveModel', {
        model : con.model,
        data  : con.dataBeforeChange,
    }), true, 'restores the original state of the model');

    sand.restore();
    t.end();
});

test('notes/form/Controller: onRejectCancel()', t => {
    const con   = new Controller({});
    con.view    = new View({isClosed: true, focus: 'title'});
    const focus = sand.stub();
    con.view.ui = {title: {focus}};
    sand.stub(con.view, 'trigger');

    con.onRejectCancel();
    t.equal(con.view.trigger.calledWith('bind:keys'), true,
        'triggers bind:keys event');
    t.equal(focus.called, true, 'brings back the focus to the title form element');

    con.view.options.focus = 'editor';
    const trigger = sand.stub(Radio, 'trigger');
    con.onRejectCancel();
    t.equal(trigger.calledWith('components/editor', 'focus'), true,
        'brings the focus to the editor');

    sand.restore();
    t.end();
});
