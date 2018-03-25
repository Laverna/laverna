/**
 * Test models/Tag
 * @file
 */
import test from 'tape';
import Tag from '../../../app/scripts/models/Tag';

test('Tag: storeName', t => {
    const tag = new Tag();
    t.equal(tag.storeName, 'tags');
    t.end();
});

test('Tag: defaults', t => {
    const defaults = new Tag().defaults;

    t.equal(defaults.type, 'tags');
    t.equal(defaults.id, undefined);
    t.equal(defaults.name, '');

    ['count', 'trash', 'created', 'updated'].forEach(attr => {
        t.equal(defaults[attr], 0);
    });

    t.end();
});

test('Tag: encryptKeys()', t => {
    const encryptKeys = new Tag().encryptKeys;
    t.equal(Array.isArray(encryptKeys), true, 'is an array');
    t.equal(encryptKeys.indexOf('name') > -1, true, 'encrypts name');
    t.end();
});

test('Tag: validateAttributes()', t => {
    const validate = new Tag().validateAttributes;
    t.equal(Array.isArray(validate), true, 'is an array');
    t.equal(validate.indexOf('name') > -1, true, 'validates name');
    t.end();
});

test('Tag: escapeAttributes()', t => {
    const escape = new Tag().escapeAttributes;
    t.equal(Array.isArray(escape), true, 'is an array');
    t.equal(escape.indexOf('name') > -1, true, 'filters name');
    t.end();
});

test('Tag: validate()', t => {
    const tag = new Tag({id: '1'});

    t.equal(tag.validate({name: ''}).indexOf('name') > -1, true,
        'name cannot be empty');
    t.equal(tag.validate({name: 'Test'}), undefined,
        'returns undefined if name is not empty');

    t.end();
});
