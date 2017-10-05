/**
 * @file Test collections/Files
 */
import test from 'tape';
import Files from '../../../app/scripts/collections/Files';
import File from '../../../app/scripts/models/File';

test('collections/Files: sync', t => {
    const coll = new Files();
    t.equal(typeof coll.sync, 'function', 'has sync method');
    t.end();
});

test('collections/Files: profileId', t => {
    const coll = new Files();
    t.equal(coll.profileId, 'default');
    t.end();
});

test('collections/Files: model', t => {
    const coll = new Files();
    t.equal(coll.model, File, 'uses file model');
    t.end();
});
