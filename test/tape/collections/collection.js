/**
 * @file Test collections/Collection
 */
import test from 'tape';
import Collection from '../../../app/scripts/collections/Collection';
import Note from '../../../app/scripts/models/Note';

test('Collection: sync', t => {
    const coll = new Collection();
    t.equal(typeof coll.sync, 'function', 'has sync method');
    t.end();
});

test('Collection: profileId', t => {
    const coll = new Collection();
    t.equal(coll.profileId, 'notes-db');
    t.end();
});

test('Collection: profileId - can change', t => {
    const coll = new Collection();
    coll.model = Note.extend({});

    coll.profileId = 'testing';
    t.equal(coll.profileId, 'testing', 'changes a collection\'s profileId');
    t.equal(coll.model.prototype.profileId, 'testing',
        'changes a models\'s profileId');

    delete coll.model;
    t.end();
});

test('Collection: storeName', t => {
    const coll = new Collection();
    coll.model = Note.extend({});

    t.equal(typeof coll.storeName, 'string');
    t.equal(coll.storeName, 'notes');

    delete coll.model;
    t.end();
});
