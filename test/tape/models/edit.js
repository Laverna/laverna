/**
 * Test models/Edit
 * @file
 */
import test from 'tape';
import Edit from '../../../app/scripts/models/Edit';
import Shadow from '../../../app/scripts/models/Shadow';

test('models/Edit: storeName', t => {
    const note = new Edit();
    t.equal(note.storeName, 'edits');
    t.end();
});

test('models/Edit: defaults', t => {
    const def = new Edit().defaults;
    t.equal(def.id, undefined);
    t.equal(def.username, '', 'msg');
    t.equal(def.deviceId, '');
    t.equal(def.docType, '');
    t.equal(def.docId, '');
    t.equal(def.encryptedData, '');
    t.equal(Array.isArray(def.diffs), true, 'stores diffs');
    t.equal(def.p, 0);

    t.end();
});

test('models/Edit: encryptKeys', t => {
    const keys = new Edit().encryptKeys;
    t.equal(Array.isArray(keys), true, 'returns an array');
    t.equal(keys.indexOf('diffs') !== -1, true, 'encrypts diffs');

    t.end();
});

test('models/Edit: validateAttributes', t => {
    const attrs = new Edit().validateAttributes;
    t.equal(Array.isArray(attrs), true, 'returns an array');
    t.equal(attrs.indexOf('docId') !== -1, true, 'docId cannot be empty');
    t.equal(attrs.indexOf('docType') !== -1, true, 'docType cannot be empty');

    t.end();
});

test('models/Edit: addDiff()', t => {
    const edit   = new Edit();
    const diff   = 'test diff';

    edit.addDiff({diff, shadow: {attributes: {p: 1, m: 2}}});
    t.equal(edit.get('p'), 1, 'updates "p" version');
    t.deepEqual(edit.get('diffs')[0], {diff, p: 1, m: 2}, 'adds a new diff');

    edit.addDiff({diff, shadow: {attributes: {p: 2, m: 2}}});
    t.equal(edit.get('p'), 2, 'updates "p" version');
    t.deepEqual(edit.get('diffs')[1], {diff, p: 2, m: 2}, 'adds a new diff');

    t.end();
});

test('models/Edit: clearDiffs()', t => {
    const edit   = new Edit({
        p: 0,
        diffs: [
            {diff: {}, m: 0, p: 0},
            {diff: {}, m: 1, p: 1},
            {diff: {}, m: 2, p: 1},
        ],
    });
    const shadow = new Shadow({p: 1, m: 2});

    edit.clearDiffs({shadow});
    t.equal(edit.get('diffs').length, 1, 'clears diffs which received a response');
    t.equal(edit.get('p'), shadow.get('p'), 'updates "P" version');

    edit.clearDiffs({shadow, clearAll: true});
    t.equal(edit.get('diffs').length, 0, 'clears all diffs');

    t.end();
});
