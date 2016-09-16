/**
 * Test models/Config.js
 * @file
 */
import test from 'tape';

import Model from '../../../app/scripts/models/Model';

test('Model: sync()', t => {
    const model = new Model();
    t.equal(typeof model.sync, 'function', 'has sync method');
    t.end();
});

test('Model: profileId() - get', t => {
    const model = new Model();

    t.equal(model.profileId, 'notes-db', 'returns "notes-db" for default');
    model._profileId = 'test';
    t.equal(model.profileId, 'test', 'returns the value of "_profileId" property');

    t.end();
});

test('Model: profileId() - set', t => {
    const model = new Model();

    model.profileId = 'test2';
    t.equal(model.profileId, 'test2', 'can change profileId property');
    t.equal(model._profileId, 'test2', 'can change profileId property');

    t.end();
});
