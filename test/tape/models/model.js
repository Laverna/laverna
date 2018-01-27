/**
 * Test models/Config.js
 * @file
 */
import test from 'tape';

import '../../../app/scripts/utils/underscore';
import Model from '../../../app/scripts/models/Model';

test('models/Model: sync()', t => {
    const model = new Model();
    t.equal(typeof model.sync, 'function', 'has sync method');
    t.end();
});

test('models/Model: profileId() - get', t => {
    const model = new Model();

    t.equal(model.profileId, undefined, 'returns "undefined" for default');
    model._profileId = 'test';
    t.equal(model.profileId, 'test', 'returns the value of "_profileId" property');

    t.end();
});

test('models/Model: profileId() - set', t => {
    const model = new Model();

    model.profileId = 'test2';
    t.equal(model.profileId, 'test2', 'can change profileId property');
    t.equal(model._profileId, 'test2', 'can change profileId property');

    t.end();
});

test('models/Model: validateAttributes()', t => {
    const model = new Model();
    t.equal(Array.isArray(model.validateAttributes), true, 'is an array');
    t.end();
});

test('models/Model: escapeAttributes()', t => {
    const model = new Model();
    t.equal(Array.isArray(model.escapeAttributes), true, 'is an array');
    t.end();
});

test('models/Model: channel', t => {
    const model     = new Model();
    model.storeName = 'notes';
    t.equal(model.channel.channelName, 'collections/Notes');
    t.end();
});

test('models/Model: validate()', t => {
    const model = new Model();
    Object.defineProperty(model, 'validateAttributes', {
        get: () => {
            return ['title'];
        },
    });

    t.equal(model.validate({trash: 2}), undefined,
        'returns undefined if trash is equal to 2');

    t.equal(Array.isArray(model.validate({title: ''})), true,
        'returns an array if validation failed');

    t.equal(model.validate({title: 'Test'}), undefined,
        'returns undefined if there are no errors');

    t.equal(model.validate({title: {}}), undefined,
        'returns undefined if attribute is not string');

    t.end();
});

test('models/Model: setEscape()', t => {
    const model = new Model();
    Object.defineProperty(model, 'escapeAttributes', {
        get: () => {
            return ['title'];
        },
    });
    Object.defineProperty(model, 'defaults', {
        get: () => {
            return {title: ''};
        },
    });

    model.setEscape({title: 'Test<script></script>', name: 'Test'});
    t.notEqual(model.get('title'), 'Test<script></script>', 'filters XSS');

    model.setEscape({title: '', name: 'Test'});
    t.equal(model.get('title'), '', 'does nothing if an attribute is empty');

    t.end();
});

test('models/Model: getData()', t => {
    const model    = new Model({title: 'Test', test: '1'});
    model.defaults = {title: '', encryptedData: ''};

    const res = model.getData();
    t.equal(typeof res, 'object');
    t.equal(res.title, 'Test', 'contains the attribute which is in default property');
    t.equal(res.test, undefined,
        'does not contain attribute which is not in default property');
    t.equal(Object.keys(res).length, 1);

    model.set('encryptedData', 'encrypted');
    model.encryptKeys   = ['title'];
    t.deepEqual(model.getData(), {encryptedData: 'encrypted'},
        'does not contain attributes that should be encrypted');

    t.end();
});

test('models/Model: setDate()', t => {
    const model = new Model();
    Object.defineProperty(model, 'defaults', {
        get: () => {
            return {created: 0, updated: 0};
        },
    });

    model.setDate();
    t.equal(typeof model.get('updated'), 'number',
        'changes "updated" attribute');
    t.equal(typeof model.get('created'), 'number',
        'changes "created" attribute');

    t.end();
});

test('models/Model: isSharedWith()', t => {
    const model = new Model({sharedWith: ['alice'], sharedBy: 'bob'});

    t.equal(model.isSharedWith('sid'), false, 'returns false');
    t.equal(model.isSharedWith('alice'), true,
        'returns true if the model is shared with a user');
    t.equal(model.isSharedWith('bob'), true,
        'returns true if a user is the author of the model');

    t.end();
});

test('models/Model: toggleShare()', t => {
    const model = new Model({sharedWith: ['alice'], sharedBy: 'bob'});

    model.toggleShare('alice');
    t.equal(model.isSharedWith('alice'), false, 'stops sharing with a user');

    model.toggleShare('alice');
    t.equal(model.isSharedWith('alice'), true, 'starts sharing with a user again');

    t.end();
});
