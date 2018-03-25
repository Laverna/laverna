/**
 * Test models/Config.js
 * @file
 */
import test from 'tape';

import File from '../../../app/scripts/models/File';

test('File: storeName', t => {
    const file = new File();
    t.equal(file.storeName, 'files', 'storeName is equal to "files"');
    t.end();
});

test('File: defaults', t => {
    const defaults = new File().defaults;

    t.equal(defaults.type, 'files');
    t.equal(defaults.id, undefined);
    t.equal(defaults.name, '');
    t.equal(defaults.fileType, '');
    t.equal(defaults.trash, 0);
    t.equal(defaults.created, 0);
    t.equal(defaults.updated, 0);

    t.end();
});

test('File: validateAttributes', t => {
    const validate = new File().validateAttributes;

    t.equal(Array.isArray(validate), true, 'is an array');
    t.equal(validate.indexOf('src') > -1, true,
        'validates "src" attribute');
    t.equal(validate.indexOf('fileType') > -1, true,
        'validates "fileType" attribute');

    t.end();
});

test('File: escapeAttributes', t => {
    const escape = new File().escapeAttributes;

    t.equal(Array.isArray(escape), true, 'is an array');
    t.equal(escape.indexOf('name') > -1, true,
        'filters "name" attribute');

    t.end();
});
