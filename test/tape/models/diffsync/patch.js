/**
 * Test models/diffsync/Patch
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';
import jsondiffpatch from 'jsondiffpatch';

import Patch from '../../../../app/scripts/models/diffsync/Patch';
import Edits from '../../../../app/scripts/collections/Edits';
import Shadows from '../../../../app/scripts/collections/Shadows';
import Shadow from '../../../../app/scripts/models/Shadow';
import Edit from '../../../../app/scripts/models/Edit';

import Note from '../../../../app/scripts/models/Note';
import Notes from '../../../../app/scripts/collections/Notes';

let sand;
test('models/diffsync/Patch: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('models/diffsync/Patch: constructor()', t => {
    const reply = sand.stub(Patch.prototype.channel, 'reply');
    const on = sand.stub(Patch.prototype.peerChannel, 'on');
    const patch = new Patch({});

    t.equal(patch.patched, false, 'patched status is equal to false');

    t.equal(reply.calledWith({
        patched: patch.patched,
    }, patch), true, 'starts replying to requests');

    t.equal(on.calledWith({
        'received:edits'   : patch.onReceivedEdits,
        'received:response': patch.onResponse,
    }, patch), true, 'starts listening to peer events');

    sand.restore();
    t.end();
});

test('models/diffsync/Patch: onReceivedEdits()', t => {
    const patch   = new Patch({});
    patch.patched = true;
    const peer    = {username: 'alice', deviceId: '1'};
    const data    = {edits: []};
    const docs    = [new Notes()];

    const req = sand.stub(patch.channel, 'request').returns(true);
    sand.stub(patch, 'findDocs').returns(Promise.resolve(docs));
    sand.stub(patch, 'applyEdits').returns(Promise.resolve());
    sand.stub(patch, 'onPatch');

    patch.onReceivedEdits({peer, data});
    t.equal(patch.findDocs.notCalled, true,
        'does nothing if it is waiting for a peers response');

    req.returns(false);
    patch.onReceivedEdits({peer, data})
    .then(() => {
        t.equal(patch.findDocs.called, true, 'fetches documents');
        t.equal(patch.applyEdits.calledWith({peer, data, docs}), true,
            'applies the patches');
        t.equal(patch.onPatch.calledWith(data.edits, peer, docs), true,
            'calls "onPatch" method');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Patch: onPatch()', t => {
    const patch = new Patch({});
    const docs  = [new Notes()];
    const req   = sand.stub(patch.channel, 'request').returns(true);
    sand.stub(patch, 'respondDocDiff');
    sand.stub(patch, 'respondDocsDiff');

    patch.onPatch([{m: 1}], {username: 'alice'}, docs);
    t.equal(patch.respondDocDiff.calledWith({m: 1}, {username: 'alice'}, docs),
        true, 'responds with a single documents diff');

    req.returns(false);
    patch.onPatch([{m: 1}], {username: 'alice'}, docs);
    t.equal(patch.respondDocsDiff.calledWith({username: 'alice'}, docs),
        true, 'responds with several documents diff');

    sand.restore();
    t.end();
});

test('models/diffsync/Patch: respondDocsDiff()', t => {
    const patch   = new Patch({edits: new Edits()});
    const req     = sand.stub(patch.channel, 'request').returns(Promise.resolve());
    const req2    = sand.stub(patch.peerChannel, 'request');
    const peer    = {username: 'alice', deviceId: '1'};
    const docs    = [new Notes()];

    patch.respondDocsDiff(peer, docs)
    .then(() => {
        t.equal(req.calledWith('checkCollections', peer, docs), true,
            'checks collections for changes');

        t.equal(req2.calledWithMatch('send', {
            peer,
            data: {type: 'response'},
        }), true, 'sends the response to the peer');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Patch: respondDocDiff()', t => {
    const patch    = new Patch({edits: new Edits()});
    const req      = sand.stub(patch.channel, 'request').returns(Promise.resolve());
    const req2     = sand.stub(patch.peerChannel, 'request');

    const peerEdit = {username: 'alice', deviceId: '1', docId: '1', docType: 'notes'};
    const peer     = {username: 'alice', deviceId: '1'};
    const notes    = new Notes([{id: '1'}]);

    patch.respondDocDiff(peerEdit, peer, [notes])
    .then(() => {
        t.equal(req.calledWith('checkDoc', peer, notes.at(0)), true,
            'checks the document for changes');

        t.equal(req2.calledWithMatch('send', {
            peer,
            data: {type: 'response'},
        }), true, 'sends edits as a response');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Patch: onResponse()', t => {
    const patch   = new Patch({});
    patch.patched = true;
    const peer    = {username: 'alice', deviceId: '1'};
    const data    = {edits: []};
    const docs    = [new Notes()];
    sand.stub(patch.channel, 'request');

    sand.stub(patch, 'findDocs').returns(Promise.resolve(docs));
    sand.stub(patch, 'applyEdits');

    patch.onResponse({peer, data})
    .then(() => {
        t.equal(patch.patched, false, 'changes patched status to false');
        t.equal(patch.channel.request.calledWith('stopPeerWait', peer), true,
            'stops waiting for a peers response');

        t.equal(patch.findDocs.called, true, 'fetches documents');
        t.equal(patch.applyEdits.calledWith({peer, data, docs}), true,
            'applies edits to documents');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Patch: applyEdits()', t => {
    const patch = new Patch({});
    const peer  = {username: 'alice'};
    const data  = {edits: [
        {docId: '1', docType: 'notes'},
        {docId: '2', docType: 'notes'},
        {docId: ''},
    ]};
    const docs  = [new Notes([{id: '1'}, {id: '2'}])];
    const apply = sand.stub(patch, 'applyEdit');

    patch.applyEdits({peer, data, docs})
    .then(() => {
        t.equal(apply.calledWith({peer, docs, edit: data.edits[0]}), true,
            'applies the first edit');
        t.equal(apply.calledWith({peer, docs, edit: data.edits[1]}), true,
            'applies the second edit');
        t.equal(apply.calledWith({peer, docs, edit: data.edits[2]}), false,
            'ignores edits which do not have docId or docType');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Patch: applyEdit() - does nothing if the document is locked', t => {
    const patch = new Patch({});
    const req   = sand.stub(patch.channel, 'request');

    req.withArgs('isLocked', 'notes', '1').returns(true);

    patch.applyEdit({edit: {docType: 'notes', docId: '1'}});
    t.equal(req.calledWith('lockDoc', 'notes', '1'), false);

    sand.restore();
    t.end();
});

// eslint-disable-next-line
test('models/diffsync/Patch: applyEdit() - does not apply the patch if the doc is not shared', t => {
    const options = {edits: new Edits(), shadows: new Edits()};
    const patch   = new Patch(options);
    const req     = sand.stub(Radio, 'request');
    const notes   = new Notes([
        {id: '1', sharedWith: ['alice'], sharedBy: 'bob'},
    ]);
    const edit    = {docId: '1', docType: 'notes', username: 'linux', deviceId: '1'};

    // Does not apply the patch if the doc is not shared
    patch.applyEdit({edit, docs: [notes], peer: {username: 'alice2', deviceId: '1'}});
    t.equal(req.notCalled, true, 'does nothing if the doc is not shared');

    sand.restore();
    t.end();
});

test('models/diffsync/Patch: applyEdit() - applies the patch', t => {
    const options = {edits: new Edits(), shadows: new Shadows()};
    const patch   = new Patch(options);
    const docs    = [new Notes()];
    const edit    = {
        username: 'alice', deviceId: '1', docType: 'notes', docId: '1', p: 0, m: 0,
    };

    sand.stub(Radio, 'request').returns(Promise.resolve());
    const chReq   = sand.stub(patch.channel, 'request');
    chReq.withArgs('isLocked', 'notes', '1').returns(false);
    sand.stub(patch, 'patch');
    sand.stub(patch, 'rollback');

    patch.applyEdit({edit, docs, peer: {username: 'alice', deviceId: '1'}})
    .then(() => {
        t.equal(chReq.calledWith('lockDoc', 'notes', '1'), true,
            'locks the document');
        t.equal(patch.patch.called, true, 'applies patches');
        t.equal(chReq.calledWith('unlockDoc', 'notes', '1'), true,
            'unlocks the document');

        patch.shadows.findWhere({docId: '1'}).set('m', 1);
        return patch.applyEdit({edit, docs, peer: {username: 'alice', deviceId: '1'}});
    })
    .then(() => {
        t.equal(patch.rollback.called, true, 'restores the shadow from the backup');
        sand.restore();
        t.end();
    });
});

test('models/diffsync/Patch: rollback()', t => {
    const patch    = new Patch({});
    const shadow   = new Shadow({backup: {m: 0, p: 0, doc: 'Hello'}, doc: ''});
    const peerEdit = new Edit({m: 0, p: 1});
    const edit     = new Edit({diffs: [1, 2]});
    const data     = {shadow, peerEdit, edit};
    sand.stub(patch, 'patch');

    patch.rollback(data);
    t.equal(patch.patch.notCalled, true,
        'does nothing if backup version does not match the edit version');

    peerEdit.set('p', 0);
    patch.rollback(data);
    t.equal(shadow.get('doc'), 'Hello', 'rollbacks from the backup');
    t.equal(edit.get('diffs').length, 0, 'clears local edit stack');
    t.equal(patch.patch.calledWith(data), true, 'applies the patch');

    sand.restore();
    t.end();
});

// eslint-disable-next-line
test('models/diffsync/Patch: patch() - does not apply patches if there is nothing to apply', t => {
    const patch    = new Patch({edits: new Edits, shadows: new Shadows()});
    const peerEdit = new Edit({diffs: []});
    const edit     = new Edit({diffs: []});

    sand.stub(patch.edits.channel, 'request');

    patch.patch({edit, peerEdit});
    t.equal(patch.edits.channel.request.notCalled, true,
        'does nothing if diffs are empty');

    sand.restore();
    t.end();
});

test('models/diffsync/Patch: patch() - applies patches', t => {
    const patch    = new Patch({edits: new Edits, shadows: new Shadows()});
    const peerEdit = new Edit({diffs: [1, 2]});
    const edit     = new Edit({diffs: [{m: 1, p: 1}, {m: 2, p: 1}]});
    const shadow   = new Shadow({m: 2, p: 1, doc: {content: 'Hello'}});
    const doc      = new Note({content: 'Hello'});

    sand.stub(patch, 'patchDiff');
    sand.stub(patch.edits.channel, 'request');
    sand.stub(patch.shadows.channel, 'request');
    sand.stub(doc.channel, 'request');

    patch.patch({edit, peerEdit, shadow, doc});
    t.equal(patch.patchDiff.callCount, 2, 'applies all patches');

    t.equal(shadow.get('backup').m, 2, 'updates the backup version');
    t.deepEqual(shadow.get('backup').doc, {content: 'Hello'},
        'updates the backup version of the document');

    t.equal(edit.get('diffs').length, 1, 'clears the edit stack');
    t.equal(patch.edits.channel.request.calledWith('saveModel', {model: edit}),
        true, 'saves the edit model');

    t.equal(patch.shadows.channel.request.calledWith('saveModel', {model: shadow}),
        true, 'saves the shadow');

    t.equal(doc.channel.request.calledWith('saveModel', {model: doc}), false,
        'does not save the document if there are no changes');

    doc.set('changed', true);
    patch.patch({edit, peerEdit, shadow, doc});
    t.equal(doc.channel.request.calledWith('saveModel', {model: doc}), true,
        'saves the document');

    patch.liveDoc = new Note({id: '3'});
    patch.patch({edit, peerEdit, shadow, doc});
    t.equal(doc.channel.request.callCount, 2,
        'saves the document if it is not a "live" document');

    patch.liveDoc = doc;
    patch.patch({edit, peerEdit, shadow, doc});
    t.equal(doc.channel.request.callCount, 2,
        'does not save the document if it is a "live" session');

    sand.restore();
    t.end();
});

test('models/diffsync/Patch: patchDiff()', t => {
    const patch  = new Patch({configs: {username: 'bob'}});
    const doc    = new Note({id: '1'});
    const trig   = sand.stub(doc.channel, 'trigger');
    const shadow = new Shadow({p: 1, doc: {}});
    const spy    = sand.spy(patch.jsondiffpatch, 'patch');
    const diff   = {
        m: 1,
        p: 0,
        diff: jsondiffpatch.diff({}, {content: 'Hello world'}),
    };

    patch.patchDiff({shadow, doc}, {m: 0});
    t.equal(patch.patched, false,
        'does nothing if our version of the peers shadow does not match');

    patch.patchDiff({shadow, doc}, diff);
    t.equal(patch.patched, true, 'changes patched status to true');

    t.equal(spy.calledWith(shadow.get('doc'), diff.diff), true,
        'applies the patch to the shadow');
    t.deepEqual(shadow.get('doc'), {content: 'Hello world'},
        'updates the shadow');
    t.equal(shadow.get('p'), 2, 'increments our version of the peers shadow');

    t.equal(doc.get('content'), 'Hello world', 'applies the patch to the document too');
    t.equal(trig.calledWith('save:object:1'), true,
        'triggers save:object:1 to notify other components');

    sand.restore();
    t.end();
});
