/**
 * @file Test collections/Files
 */
import test from 'tape';
import Files from '../../../app/scripts/collections/Files';
import File from '../../../app/scripts/models/File';

test('Collection: sync', t => {
    const coll = new Files();
    t.equal(typeof coll.sync, 'function', 'has sync method');
    t.end();
});

test('Collection: profileId', t => {
    const coll = new Files();
    t.equal(coll.profileId, 'notes-db');
    t.end();
});

test('Files: model', t => {
    const coll = new Files();
    t.equal(coll.model, File, 'uses file model');
    t.end();
});
