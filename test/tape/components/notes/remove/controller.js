/**
 * Test: components/notes/remove/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Note from '../../../../../app/scripts/models/Note';
import Controller from '../../../../../app/scripts/components/notes/remove/Controller';
import _ from '../../../../../app/scripts/utils/underscore';

let sand;
test('notes/remove/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/remove/Controller: channel', t => {
    const channel = Controller.prototype.channel;
    t.equal(typeof channel, 'object', 'returns an object');
    t.equal(channel.channelName, 'components/notes');

    t.end();
});

test('notes/remove/Controller: labels', t => {
    const labels = Controller.prototype.labels;
    t.equal(typeof labels, 'object', 'returns an object');
    t.equal(labels.trash, 'notes.confirm trash');
    t.equal(labels.remove, 'notes.confirm remove');
    t.end();
});

test('notes/remove/Controller: constructor()', t => {
    const reply = sand.stub(Controller.prototype.channel, 'reply');
    const con   = new Controller();
    t.equal(reply.calledWith('remove', con.remove, con), true,
        'replies to remove request');

    sand.restore();
    t.end();
});

test('notes/remove/Controller: remove()', t => {
    const con   = new Controller();
    const model = new Note({id: '1'});

    sand.stub(con, 'removeModel');
    con.remove({model});
    t.equal(con.removeModel.calledWith({model}), true,
        'calls removeModel method if model is provided');

    sand.stub(con, 'removeById');
    const options = {id: '1'};
    con.remove(options);
    t.equal(con.removeById.calledWith(options), true,
        'calls removeById method if id is provided');

    con.remove({})
    .catch(() => {
        con.channel.stopListening();
        sand.restore();
        t.end();
    });
});

test('notes/remove/Controller: removeById()', t => {
    const con   = new Controller();
    const model = new Note({id: '1'});
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve(model));
    sand.stub(con, 'removeModel');

    const res = con.removeById({id: '1'});

    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(req.calledWith('collections/Notes', 'findModel', {
        id: '1',
    }), true, 'makes findModel request');

    res.then(() => {
        t.equal(con.removeModel.calledWith({model, id: '1'}), true,
            'calls removeModel method');

        con.channel.stopListening();
        sand.restore();
        t.end();
    });
});

test('notes/remove/Controller: removeModel()', t => {
    const con   = new Controller();
    const model = new Note({id: '1'});
    const req   = sand.stub(Radio, 'request');
    sand.stub(con, 'showConfirm').returns(Promise.resolve('reject'));

    con.removeModel({model: {id: '2'}})
    .then(() => {
        t.equal(req.notCalled, true,
            'does nothing if showConfirm resolved with false');

        return con.removeModel({model, force: true});
    })
    .then(() => {
        t.equal(con.showConfirm.calledWith(model), false,
            'does not show a confirmation dialog if force=true');
        t.equal(req.calledWith('collections/Notes', 'remove', {model}), true,
            'makes "remove" request');

        con.showConfirm.returns(Promise.resolve('resolve'));
        return con.removeModel({model});
    })
    .then(() => {
        t.equal(con.showConfirm.calledWith(model), true,
            'shows a confirmation dialog');

        con.channel.stopListening();
        sand.restore();
        t.end();
    });
});

test('notes/remove/Controller: showConfirm()', t => {
    const con   = new Controller();
    const model = new Note({id: '1', trash: 0});
    const req   = sand.stub(Radio, 'request');

    sand.stub(_, 'i18n');
    _.i18n.withArgs(con.labels.trash).returns(con.labels.trash);
    _.i18n.withArgs(con.labels.remove).returns(con.labels.remove);

    con.showConfirm(model);
    t.equal(req.calledWith('components/confirm', 'show', {
        content: con.labels.trash,
    }), true, 'asks if a user is sure they want to put a note to trash');

    model.set('trash', 1);
    con.showConfirm(model);
    t.equal(req.calledWith('components/confirm', 'show', {
        content: con.labels.remove,
    }), true, 'asks if a user is sure they want to put a note to trash');

    con.channel.stopListening();
    sand.restore();
    t.end();
});
