/**
 * Test if it diffs and patches correctly.
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import _ from '../../../../app/scripts/utils/underscore';

import Diff from '../../../../app/scripts/models/diffsync/Diff';
import Patch from '../../../../app/scripts/models/diffsync/Patch';
import Edits from '../../../../app/scripts/collections/Edits';
import EditsModule from '../../../../app/scripts/collections/modules/Edits';
import Shadows from '../../../../app/scripts/collections/Shadows';
import Note from '../../../../app/scripts/models/Note';
import Notes from '../../../../app/scripts/collections/Notes';

let sand;
let peer1;
let peer2;

/**
 * Makes changes on peer#1's document.
 *
 * @param {Object} from [peer1,peer2]
 * @param {Object} to [peer1,peer2]
 * @param {Number} numberOfChanges
 */
function makeChanges(from, to, numberOfChanges = 10) {
    // Make changes to peer#1's doc
    let promise = Promise.resolve();
    for (let i  = 0; i < numberOfChanges; i++) {
        promise = promise.then(() => {
            from.doc.set('content', `${from.doc.get('content')} ${from.peer.username}'s change.`);
            return from.diff.checkDoc(to.peer, from.doc);
        });
    }
    return promise;
}

/**
 * Apply a peer's changes.
 *
 * @param {Object} from - A peer who sent the changes
 * @param {Object} to - A peer who should apply changes
 * @returns {Promise}
 */
function applyEdit(from, to) {
    return to.patch.applyEdit({
        peer: from.peer,
        docs: to.docs,
        edit: from.diff.edits.findForDoc(to.peer, from.doc).getData(),
    });
}

test('models/diffsync: before()', t => {
    sand = sinon.sandbox.create();
    Radio.reply('models/Encryption', 'decryptModel', model => Promise.resolve(model));

    Radio.channel('collections/Edits').stopReplying();
    Radio.channel('collections/Shadows').stopReplying();
    Radio.channel('collections/Notes').stopReplying();

    // Instantiate classes for the peer #1
    peer1 = {
        doc  : new Note({id: '1', title: 'Hello', sharedWith: ['Bob']}),
        peer : {username: 'Alice', deviceId: '1'},
    };
    peer1.diff = new Diff({
        shadows : new Shadows(),
        edits   : new Edits(),
        configs : peer1.peer,
    });
    peer1.patch = new Patch({
        shadows : peer1.diff.shadows,
        edits   : peer1.diff.edits,
        configs : peer1.diff.options.configs,
    });
    peer1.docs = [new Notes([peer1.doc])];

    // Instantiate classes for the peer #2
    peer2 = {
        peer : {username: 'Bob', deviceId: '1'},
    };
    peer2.diff = new Diff({
        shadows : new Shadows(),
        edits   : new Edits(),
        configs : peer2.peer,
    });
    peer2.patch = new Patch({
        shadows : peer2.diff.shadows,
        edits   : peer2.diff.edits,
        configs : peer2.diff.options.configs,
    });
    peer2.docs = [new Notes()];

    t.end();
});

test('models/diffsync:Diff: creates document diffs', t => {
    let promise  = Promise.resolve();
    let count    = 0;

    for (let i = 0; i < 10; i++) {
        promise = promise.then(() => {
            count++;
            peer1.doc.set('content', `${peer1.doc.get('content')} Text #${count}.`);
            return peer1.diff.checkDoc(peer2.peer, peer1.doc);
        });
    }

    peer1.tShadow = peer1.diff.shadows.findForDoc(peer2.peer, peer1.doc);
    peer1.tEdit   = peer1.diff.edits.findForDoc(peer2.peer, peer1.doc);

    return promise.then(() => {
        t.equal(peer1.doc.get('content').length, 91, 'Changed the document content');

        t.equal(peer1.tShadow.get('m'), 10, 'increases "m" version');
        t.equal(peer1.tShadow.get('doc').content, peer1.doc.get('content'),
            'shadow has the same content as the document');

        t.equal(peer1.tEdit.get('diffs').length, 10, 'created 10 diffs');

        sand.restore();
        t.end();
    })
    .catch(err => {
        console.log('error', err);
        t.comment(`error ${err}`);
        t.end();
    });
});

test('models/diffsync:Patch: applies diffs/patches', t => {
    return applyEdit(peer1, peer2)
    .then(() => {
        peer2.doc     = peer2.docs[0].get({id: '1'});
        peer2.tShadow = peer2.patch.shadows.findForDoc(peer1.peer, peer2.doc);

        t.equal(peer2.doc.get('sharedBy'), 'Alice', 'sets "sharedBy" attribute to "Alice"');
        t.equal(peer2.doc.get('content').length, 91, 'Changes the document content');

        t.equal(peer2.tShadow.get('p'), 10, 'increases "p" version');
        t.equal(peer2.doc.get('content'), peer2.tShadow.get('doc').content,
            'shadow has the same content as the document');

        t.equal(peer2.doc.get('content'), peer1.tShadow.get('doc').content,
            'Bob has the same content as Alice');

        t.end();
    })
    .catch(err => {
        console.log('error', err);
        t.comment(`error ${err}`);
        t.end();
    });
});

test('models/diffsync:Patch: applies peer#1 changes even if peer#2 made changes', t => {
    // Change peer#2's doc
    peer2.doc.set('content', `${peer2.doc.get('content')} Peer#2's change.`);

    return makeChanges(peer1, peer2)
    .then(() => applyEdit(peer1, peer2))
    .then(() => {
        t.equal(peer2.doc.get('content').length, 268, 'applies all changes');
        t.notEqual(peer2.doc.get('content'), peer1.doc.get('content'),
            'peer#1\'s doc is not equal to peer#2\'s');

        return peer2.diff.checkDoc(peer1.peer, peer2.doc);
    })
    .then(() => applyEdit(peer2, peer1))
    .then(() => {
        t.equal(peer1.doc.get('content').length, 268);
        t.equal(peer2.doc.get('content').length, peer1.doc.get('content').length,
            'peer#1\'s doc is equal to peer#2\'s');
        t.equal(peer2.doc.get('content'), peer1.doc.get('content'));
        t.end();
    })
    .catch(err => {
        console.log('error', err);
        t.comment(`error ${err}`);
        t.end();
    });
});

test('models/diffsync:Patch: recovers from conflicts', t => {
    // Change peer#2's doc
    peer2.doc.set('content', `${peer2.doc.get('content')} Peer#2's change.`);
    peer2.tEdit = peer2.diff.edits.findForDoc(peer1.peer, peer2.doc);

    return makeChanges(peer1, peer2, 10)
    // Peer #2: apply the changes
    .then(() => applyEdit(peer1, peer2))
    .then(() => peer2.diff.checkDoc(peer1.peer, peer2.doc))
    /* Peeer #1: emulate a network failure by adding diffs to the edit stack
     * and not letting the peer#1 "receive" response diffs.
     */
    .then(() => makeChanges(peer1, peer2, 10))
    .then(() => applyEdit(peer1, peer2))
    .then(() => peer2.diff.checkDoc(peer1.peer, peer2.doc))

    .then(() => makeChanges(peer1, peer2, 10))
    .then(() => peer2.diff.checkDoc(peer1.peer, peer2.doc))
    .then(() => makeChanges(peer1, peer2, 10))
    .then(() => applyEdit(peer1, peer2))
    .then(() => makeChanges(peer2, peer1))

    .then(() => makeChanges(peer1, peer2, 100))
    .then(() => applyEdit(peer1, peer2))
    // Finally, let the peer#1 receive & apply the changes
    .then(() => peer2.diff.checkDoc(peer1.peer, peer2.doc))
    .then(() => applyEdit(peer2, peer1))
    .then(() => {
        t.equal(peer2.doc.get('content').length, peer1.doc.get('content').length,
            'peer#1\'s doc length is equal to peer#2\'s');
        t.equal(peer2.doc.get('content'), peer1.doc.get('content'),
            'peer#1\'s doc is equal to peer#2\'s');

        t.end();
    })
    .catch(err => {
        console.log('error', err);
        t.comment(`error ${err}`);
        t.end();
    });
});

test('models/diffsync/:Patch: can handle removals', t => {
    peer1.doc.set('content', '');
    peer2.doc.set('content', `${peer2.doc.get('content')} Peer#2's changes.`);

    return peer1.diff.checkDoc(peer2.peer, peer1.doc)
    .then(() => applyEdit(peer1, peer2))
    .then(() => peer2.diff.checkDoc(peer1.peer, peer2.doc))
    .then(() => applyEdit(peer2, peer1))
    .then(() => {
        t.equal(peer1.doc.get('content').length, peer2.doc.get('content').length);
        t.equal(peer1.doc.get('content'), peer2.doc.get('content'));
        t.end();
    });
});

/**
 * Emulate a situation when both peers go offline.
 * Boh peers make a lot of changes then go online and send each other their changes.
 */
test('models/diffsync/:Patch: recovers even after both peers go offline and make a lot of changes', t => {
    return Promise.all([
        makeChanges(peer1, peer2, 100),
        makeChanges(peer2, peer1, 100),
    ])
    .then(() => applyEdit(peer1, peer2))
    .then(() => peer2.diff.checkDoc(peer1.peer, peer2.doc))
    .then(() => applyEdit(peer2, peer1))
    .then(() => {
        t.equal(peer1.doc.get('content').length > 0, true);
        t.equal(peer1.doc.get('content').length, peer2.doc.get('content').length);
        t.equal(peer1.doc.get('content'), peer2.doc.get('content'));
        t.end();
    })
    .catch(err => {
        console.log('error', err);
        t.comment(`Error: ${err}`);
        t.end();
    });
});

test('models/diffsync: after()', t => {
    Radio.channel('models/Encryption').stopReplying();
    sand.restore();
    t.end();
});
