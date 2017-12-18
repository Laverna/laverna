/**
 * Test models/Shadow
 * @file
 */
import test from 'tape';
import _ from 'underscore';
import Shadow from '../../../app/scripts/models/Shadow';

test('models/Shadow: storeName', t => {
    const note = new Shadow();
    t.equal(note.storeName, 'shadows');
    t.end();
});

test('models/Shadow: defaults', t => {
    const def = new Shadow().defaults;
    t.equal(def.id, undefined);
    t.equal(def.username, '');
    t.equal(def.deviceId, '');
    t.equal(def.docType, '');
    t.equal(def.docId, '');
    t.equal(typeof def.doc, 'object');
    t.equal(typeof def.backup, 'object');
    t.equal(def.encryptedData, '');
    t.equal(def.p, 0);
    t.equal(def.m, 0);

    t.end();
});

test('models/Shadow: encryptKeys', t => {
    const keys = new Shadow().encryptKeys;
    t.equal(Array.isArray(keys), true, 'returns an array');
    t.equal(keys.indexOf('doc') !== -1, true, 'encrypts doc');
    t.equal(keys.indexOf('backup') !== -1, true, 'encrypts backup');

    t.end();
});

test('models/Shadow: validateAttributes', t => {
    const attrs = new Shadow().validateAttributes;
    t.equal(Array.isArray(attrs), true, 'returns an array');
    t.equal(attrs.indexOf('docId') !== -1, true, 'docId cannot be empty');
    t.equal(attrs.indexOf('docType') !== -1, true, 'docType cannot be empty');

    t.end();
});

test('models/Shadow: createBackup()', t => {
    const data   = {doc: {title: 'My note'}, m: 1, p: 2};
    const shadow = new Shadow(data);

    shadow.createBackup();
    t.deepEqual(shadow.get('backup'), _.omit(data, 'p'), 'creates a full backup of the shadow');
    t.equal(shadow.get('backup').p, undefined, 'does not contain "p" version');

    shadow.createBackup(2);
    t.deepEqual(shadow.get('backup'), {doc: data.doc, m: 2},
        'creates a full backup of the shadow');

    t.end();
});

test('models/Shadow: updateDoc()', t => {
    const shadow = new Shadow({m: 1, p: 2});
    const doc    = {title: 'Test'};

    shadow.updateDoc(doc, 'm');
    t.equal(shadow.get('doc'), doc, 'updates "doc" attribute');
    t.equal(shadow.get('m'), 2, 'increases "m" version');

    shadow.updateDoc(doc, 'p');
    t.equal(shadow.get('p'), 3, 'increases "p" version');

    t.end();
});
