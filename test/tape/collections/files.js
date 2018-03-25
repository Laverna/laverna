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
    t.equal(new Files().profileId, undefined, 'is undefined by default');
    t.equal(new Files(null, {profileId: 'test'}).profileId, 'test');
    t.end();
});

test('collections/Files: model', t => {
    const coll = new Files();
    t.equal(coll.model, File, 'uses file model');
    t.end();
});
