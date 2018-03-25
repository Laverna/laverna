/**
 * Test models/diffsync/Diff
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import jsondiffpatch from 'jsondiffpatch';

import _ from '../../../../app/scripts/utils/underscore';
import Diff from '../../../../app/scripts/models/diffsync/Diff';
import Edits from '../../../../app/scripts/collections/Edits';
import Shadows from '../../../../app/scripts/collections/Shadows';
import Model from '../../../../app/scripts/models/Note';

import Notes from '../../../../app/scripts/collections/Notes';
import Tags from '../../../../app/scripts/collections/Tags';
import Files from '../../../../app/scripts/collections/Files';

const options = {
    profileId : 'test',
    configs   : {username: 'bob'},
    wait      : 30000,
    docWait   : {
        min   : 1000,
        max   : 15000,
        wait  : 1000,
    },
    docsWait  : {
        min   : 8000,
        max   : 20000,
        wait  : 8000,
    },
};

let sand;
test('models/diffsync/Diff: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('models/diffsync/Diff: constructor()', t => {
    const on    = sand.stub(Diff.prototype.formChannel, 'on');
    const reply = sand.stub(Diff.prototype.channel, 'reply');
    const diff  = new Diff({});

    t.deepEqual(diff.pids, {doc: 0, docs: 0}, 'creates "pids" property');
    t.equal(diff.liveDoc, null, 'liveDoc is equal to null by default');
    t.equal(diff.diffed, false, 'diffed is equal to false by default');

    t.equal(on.calledWith({
        ready            : diff.onEditor,
        'before:destroy' : diff.onEditorStop,
    }, diff), true, 'starts listening to editor events');

    t.equal(reply.calledWith({
        liveDoc          : diff.liveDoc,
        checkDoc         : diff.checkDoc,
        checkCollections : diff.checkCollections,
    }, diff), true, 'starts replying to events');

    sand.restore();
    t.end();
});

test('models/diffsync/Diff: onEditor()', t => {
    const diff = new Diff({});
    const model = new Model({id: '1'});
    sand.stub(diff, 'schedule');

    diff.onEditor({model: {content: '1'}});
    t.equal(diff.schedule.notCalled, true, 'does nothing if it is a new model');

    diff.onEditor({model});
    t.equal(diff.liveDoc, model, 'saves the model to "liveDoc" property');
    t.equal(diff.schedule.called, true, 'schedules a new diff check');

    sand.restore();
    t.end();
});

test('models/diffsync/Diff: onEditorStop()', t => {
    const diff   = new Diff({});
    diff.liveDoc = new Model();
    sand.stub(diff, 'schedule');

    diff.onEditorStop();
    t.equal(diff.liveDoc, null, 'removes "liveDoc" property');
    t.equal(diff.schedule.called, true, 'schedules a new diff check');

    sand.restore();
    t.end();
});

test('models/diffsync/Diff: schedule()', t => {
    const diff = new Diff({});
    const set  = sand.stub(window, 'setTimeout').returns(1);
    sand.stub(diff, 'calcWait');
    sand.stub(diff, 'unschedule');

    diff.schedule();
    t.equal(diff.unschedule.calledWith('doc'), true, 'unschedules a doc check');
    t.equal(diff.unschedule.calledWith('docs'), true, 'unschedules a docs check');

    t.equal(diff.calcWait.calledWith('docs'), true,
        'calculates the amount of time it waits to check for changes in docs');
    t.equal(set.called, true, 'schedules a check');
    t.equal(diff.pids.docs, 1, 'saves the timeout ID');

    diff.liveDoc = new Model();
    diff.schedule();
    t.equal(diff.calcWait.calledWith('doc'), true,
        'calculates the amount of time it waits to check for changes in a doc');

    sand.restore();
    t.end();
});

test('models/diffsync/Diff: calcWait() - increase the timeout', t => {
    const diff = new Diff(options);

    t.equal(diff.calcWait('doc') > options.docWait.min, true,
        'increases the amount of time if there are no changes');

    for (let i = 0; i < 100; i++) {
        diff.calcWait('doc');
    }

    t.equal(diff.calcWait('doc'), options.docWait.max,
        'the wait does not get bigger than the maximum');
    t.equal(diff.options.docWait.wait, options.docWait.max,
        'updates wait option');

    sand.restore();
    t.end();
});

function testDecreaseCalc(diff, t, type = 'diff') {
    options.docWait.wait = options.docWait.max;

    t.equal(diff.calcWait('doc') < options.docWait.max, true,
        `decreases the timeout if there was a ${type} change`);

    for (let i = 0; i < 100; i++) {
        diff.calcWait('doc');
    }

    t.equal(diff.calcWait('doc'), options.docWait.min,
        'the wait time does not get smaller than the minimum');
}

test('models/diffsync/Diff: calcWait() - decrease the timeout', t => {
    const diff  = new Diff(options);
    diff.diffed = true;

    testDecreaseCalc(diff, t, 'diff');

    sand.stub(diff.channel, 'request').returns(true);
    diff.diffed = false;
    testDecreaseCalc(diff, t, 'patch');

    t.end();
});

test('models/diffsync/Diff: unschedule()', t => {
    const diff  = new Diff({});
    const clear = sand.stub(window, 'clearTimeout');

    diff.unschedule();
    t.equal(clear.notCalled, true,
        'does nothing if there are not any scheduled checks');

    diff.pids.doc  = 1;
    diff.pids.docs = 2;
    diff.unschedule('doc');
    t.equal(clear.calledWith(1), true,
        'clears a timeout for a single document check');

    diff.unschedule('docs');
    t.equal(clear.calledWith(2), true,
        'clears a timeout for documents check');

    sand.restore();
    t.end();
});

test('models/diffsync/Diff: docsSync()', t => {
    const diff  = new Diff({});
    diff.diffed = true;
    const docs  = [new Notes()];
    const check = sand.stub(diff, 'checkDocsPeers');
    sand.stub(diff, 'findDocs').returns(Promise.resolve(docs));
    sand.stub(diff, 'schedule');

    const res = diff.docsSync();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(diff.diffed, false, 'changes "diffed" status to false');
    t.equal(diff.findDocs.called, true, 'fetches documents first');

    res.then(() => {
        t.equal(check.calledWith(docs), true, 'checks for changes in documents');
        t.equal(diff.schedule.calledAfter(check), true,
            'schedules a new check');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: checkDocPeers()', t => {
    const diff  = new Diff({});
    const req   = sand.stub(diff.channel, 'request');
    const check = sand.stub(diff, 'checkCollections');
    const docs  = [new Notes()];
    const peers = [
        {username: 'alice', deviceId: '1'},
        {username: 'alice', deviceId: '2'},
    ];
    req.withArgs('getClientPeers').returns(peers);
    req.withArgs('isPending', peers[0]).returns(true);
    req.withArgs('isPending', peers[1]).returns(false);

    diff.checkDocsPeers(docs)
    .then(() => {
        t.equal(check.calledWith(peers[0], docs), false,
            'does not compute diffs for a peer who still has not sent a response');

        t.equal(check.calledWith(peers[1], docs, true), true,
            'computes diffs for a peer');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: checkCollections() - synchronize shared documents only', t => {
    const diff  = new Diff(options);
    const check = sand.stub(diff, 'checkDocs');
    const send  = sand.stub(diff, 'sendPeerDiffs');
    const notes = new Notes([
        {id: 1, sharedWith: ['alice']},
        {id: 2, sharedBy: 'alice', sharedWith: []},
        {id: 3, sharedBy: 'bob', sharedWith: []},
    ]);
    const tags  = new Tags();
    const docs  = [notes, tags, new Files()];
    const peer  = {username: 'alice', deviceId: '1'};

    diff.checkCollections(peer, docs, true)
    .then(() => {
        t.equal(check.calledWith(peer, notes), false, 'does not synchronize all notes');
        t.equal(check.calledWith(peer, tags), false, 'does not synchronize all tags');

        const sharedNotes = notes.filter(note => note.id < 3);
        t.equal(check.calledWith(peer, sharedNotes), true,
            'synchronizes notes shared with a user');

        t.equal(send.calledWith(peer), true, 'sends edits to a peer');

        sand.restore();
        t.end();
    });
});

// eslint-disable-next-line
test('models/diffsync/Diff: checkCollections() - synchronize all documents if a user is syncing with their own device', t => {
    const diff  = new Diff(options);
    const check = sand.stub(diff, 'checkDocs');
    const peer  = {username: 'bob', deviceId: '1'};
    const docs  = [
        new Notes([{id: '1'}, {id: '2'}]),
        new Tags([{id: '1'}, {id: '2'}]),
    ];
    sand.stub(diff, 'sendPeerDiffs');

    diff.checkCollections(peer, docs, false)
    .then(() => {
        t.equal(check.calledWith(peer, docs[0]), true, 'synchronizes all notes');
        t.equal(check.calledWith(peer, docs[1]), true, 'synchronizes all tags');

        t.equal(diff.sendPeerDiffs.notCalled, true,
            'does not send edits if "send" parameter is false');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: sendPeerDiffs()', t => {
    options.edits = new Edits([
        {username: 'alice', deviceId: '1', docType: 'notes'},
        {username: 'alice', deviceId: '1', docType: 'tags'},
        {username: 'alice', deviceId: '2', docType: 'tags'},
        {username: 'bob', deviceId: '1', docType: 'tags'},
    ]);
    const diff    = new Diff(options);
    const req     = sand.stub(diff.channel, 'request');
    const req2    = sand.stub(diff.peerChannel, 'request');
    const peer    = {username: 'alice', deviceId: '1'};

    let edits = options.edits.filter(edit => {
        return edit.get('username') === 'alice' && edit.get('deviceId') === '1';
    });
    edits     = _.map(edits, edit => edit.getData());

    diff.sendPeerDiffs(peer);

    t.equal(req.calledWith('waitPeer', peer), true, 'schedules "response" timeout');
    t.equal(req2.calledWithMatch('send', {
        peer,
        data: {edits, type: 'edits'},
    }), true, 'sends edits to a peer');

    sand.restore();
    t.end();
});

test('models/diffsync/Diff: checkDocs()', t => {
    const diff  = new Diff(options);
    const notes = new Notes([{id: '1'}, {id: '2'}, {id: '3'}, {}]);
    const peer  = {username: 'alice', deviceId: '1'};
    sand.stub(diff, 'checkDoc');

    diff.checkDocs(peer, notes)
    .then(() => {
        t.equal(diff.checkDoc.callCount, notes.length - 1,
            'checks all documents that have IDs');
        t.equal(diff.checkDoc.calledWith(peer, notes.at(0)), true,
            'checks for changes a document');

        return diff.checkDocs(peer, notes.models)
    })
    .then(() => {
        t.equal(diff.checkDoc.callCount, 2 * (notes.length - 1),
            'can check an array of models');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: docSync()', t => {
    const diff   = new Diff(options);
    diff.diffed  = true;
    diff.liveDoc = new Model();
    const check  = sand.stub(diff, 'checkDocPeers').returns(Promise.resolve());
    sand.stub(diff, 'schedule');

    diff.docSync()
    .then(() => {
        t.equal(diff.diffed, false, 'changes "diffed" status to false');
        t.equal(check.calledWith(diff.liveDoc, true), true,
            'checks a single document for changes');
        t.equal(diff.schedule.calledAfter(check), true,
            'schedules a new check at the end');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: checkDocPeers()', t => {
    const diff  = new Diff(options);
    const doc   = new Model({id: '1', sharedWith: ['alice', 'bob']});
    const req   = sand.stub(diff.channel, 'request');
    const peers = [
        {username: 'alice', deviceId: '1'},
        {username: 'bob', deviceId: '1'},
    ];

    req.withArgs('isLocked', 'notes', '1').returns(true);
    sand.stub(diff, 'findDocPeers').returns(peers);

    req.withArgs('isPending', peers[0]).returns(false);
    req.withArgs('isPending', peers[1]).returns(true);

    const check = sand.stub(diff, 'checkDoc').returns(Promise.resolve());
    const send  = sand.stub(diff, 'sendDocDiffs');

    diff.checkDocPeers(doc);
    t.equal(check.notCalled, true, 'does nothing if the document is locked');

    req.withArgs('isLocked', 'notes', '1').returns(false);
    diff.checkDocPeers(doc)
    .then(() => {
        t.equal(req.calledWith('lockDoc', 'notes', '1'), true,
            'locks the document');
        t.equal(req.calledWith('unlockDoc', 'notes', '1'), true,
            'unlocks the document at the end');

        t.equal(check.called, true,
            'synchronizes the document with a peer');
        t.equal(check.calledWith(peers[1], doc), false,
            'does nothing if it is waiting for a peers response');

        t.equal(send.notCalled, true,
            'does not send changes to a peer if "send" is false');

        return diff.checkDocPeers(doc, true);
    })
    .then(() => {
        t.equal(send.calledWith(peers[0], doc), true, 'sends changes to a peer');
        t.equal(send.callCount, 1,
            'sends changes only to peers who do not have pending requests');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: checkDoc()', t => {
    options.edits   = new Edits();
    options.shadows = new Shadows();
    const diff      = new Diff(options);
    const doc       = new Model({id: '1', content: 'Hello world'});
    const peer      = {username: 'bob', deviceId: '1'};

    const req  = sand.stub(Radio, 'request');
    const req2 = sand.stub(doc.channel, 'request');

    diff.checkDoc(peer, new Model());
    t.equal(req.notCalled, true, 'does nothing if the model does not have an ID');

    diff.checkDoc(peer, doc)
    .then(() => {
        t.equal(diff.diffed, true, 'changes diffed status to true');
        t.equal(req.calledWith('collections/Edits', 'saveModel'), true,
            'saves the edits stack');
        t.equal(req.calledWith('collections/Shadows', 'saveModel'), true,
            'saves the shadow');
        t.equal(req2.calledWith('saveModel', {model: doc}), true,
            'saves the document');

        diff.diffed = false;
        return diff.checkDoc(peer, doc);
    })
    .then(() => {
        t.equal(req.callCount, 2, 'does nothing if there is no change');
        t.equal(diff.diffed, false, 'does not change diffed status');

        doc.set('content', 'Hello!');
        diff.liveDoc = doc;
        return diff.checkDoc(peer, doc);
    })
    .then(() => {
        t.equal(req2.callCount, 1,
            'does not save the document if it is a "live" session');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Diff: sendDocDiffs()', t => {
    const diff = new Diff(options);
    const doc  = new Model({id: '1'});
    const peer = {username: 'alice', deviceId: '1'};

    sand.stub(diff.channel, 'request');
    sand.stub(diff.peerChannel, 'request');

    diff.sendDocDiffs(peer, doc);

    t.equal(diff.channel.request.calledWith('waitPeer', peer), true,
        'starts waiting for a peers response');
    t.equal(diff.peerChannel.request.calledWithMatch('send', {
        peer,
        data: {type: 'edits'},
    }), true, 'sends diffs to the peer');

    sand.restore();
    t.end();
});
