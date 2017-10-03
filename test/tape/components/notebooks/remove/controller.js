/**
 * Test: components/notebooks/remove/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import Notebook from '../../../../../app/scripts/models/Notebook';
import Tag from '../../../../../app/scripts/models/Tag';
import Controller from '../../../../../app/scripts/components/notebooks/remove/Controller';
import _ from '../../../../../app/scripts/utils/underscore';
/* eslint-enable */

let sand;
test('notebooks/remove/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notebooks/remove/Controller: channel', t => {
    const channel = Controller.prototype.channel;
    t.equal(typeof channel, 'object', 'returns an object');
    t.equal(channel.channelName, 'components/notebooks');

    t.end();
});

test('notebooks/remove/Controller: constructor()', t => {
    const reply = sand.stub(Controller.prototype.channel, 'reply');
    const con   = new Controller();
    t.equal(reply.calledWith('remove', con.remove, con), true,
        'replies to remove request');

    sand.restore();
    t.end();
});

test('notebooks/remove/Controller: remove()', t => {
    const con   = new Controller();
    const model = new Notebook({id: '1'});
    sand.stub(con, 'showConfirm').resolves('confirm');
    sand.stub(con, 'requestRemove');

    const res = con.remove({model});
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(con.showConfirm.calledWith(model), true, 'shows a confirmation dialog');

    res.then(() => {
        t.equal(con.requestRemove.calledAfter(con.showConfirm), true,
            'calls requestRemove method after showing the confirmation dialog');
        t.equal(con.requestRemove.calledWith(model, 'confirm'), true,
            'passes the confirm dialog result to requestRemove method');

        sand.restore();
        con.channel.stopListening();
        t.end();
    });
});

test('notebooks/remove/Controller: showConfirm()', t => {
    const con   = new Controller();
    const model = new Notebook({id: '1'});
    const req   = sand.stub(Radio, 'request');
    sand.stub(_, 'i18n').callsFake(str => str);

    con.showConfirm(new Tag({id: '1'}));
    t.equal(req.calledWith('components/confirm', 'show', {
        content: 'tags.confirm remove',
    }), true, 'shows the confirmation dialog');

    con.showConfirm(new Notebook({id: '1'}));
    t.equal(req.calledWith('components/confirm', 'show', {
        content: 'notebooks.confirm remove',
        buttons: con.notebookButtons,
    }), true, 'shows the confirmation dialog with custom buttons');

    con.channel.stopListening();
    sand.restore();
    t.end();
});

test('notebooks/remove/Controller: requestRemove()', t => {
    const con   = new Controller();
    const req   = sand.stub(Radio, 'request');

    const notebook = new Notebook({});
    con.requestRemove(notebook, 'confirmNotes');
    t.equal(req.calledWith('collections/Notebooks', 'remove', {
        model       : notebook,
        removeNotes : true,
    }), true, 'removes a notebook model');

    const tag = new Tag({});
    con.requestRemove(tag, 'confirm');
    t.equal(req.calledWith('collections/Tags', 'remove', {
        model       : tag,
        removeNotes : false,
    }), true, 'removes a tag model');

    con.channel.stopListening();
    sand.restore();
    t.end();
});
