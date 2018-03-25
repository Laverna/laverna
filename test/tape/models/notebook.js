/**
 * Test models/Notebook
 * @file
 */
import test from 'tape';
import Notebook from '../../../app/scripts/models/Notebook';

test('Notebook: storeName', t => {
    const notebook = new Notebook();
    t.equal(notebook.storeName, 'notebooks');
    t.end();
});

test('Notebook: defaults', t => {
    const defaults = new Notebook().defaults;

    t.equal(defaults.type, 'notebooks');
    t.equal(defaults.id, undefined);
    t.equal(defaults.parentId, '0');
    t.equal(defaults.name, '');

    ['count', 'trash', 'created', 'updated'].forEach(attr => {
        t.equal(defaults[attr], 0);
    });

    t.end();
});

test('Notebook: encryptKeys()', t => {
    const encryptKeys = new Notebook().encryptKeys;
    t.equal(Array.isArray(encryptKeys), true, 'is an array');
    t.equal(encryptKeys.indexOf('name') > -1, true, 'encrypts name');
    t.end();
});

test('Notebook: validateAttributes()', t => {
    const validate = new Notebook().validateAttributes;
    t.equal(Array.isArray(validate), true, 'is an array');
    t.equal(validate.indexOf('name') > -1, true, 'validates name');
    t.end();
});

test('Notebook: escapeAttributes()', t => {
    const escape = new Notebook().escapeAttributes;
    t.equal(Array.isArray(escape), true, 'is an array');
    t.equal(escape.indexOf('name') > -1, true, 'filters name');
    t.end();
});

test('Notebook: validate()', t => {
    const notebook = new Notebook({id: '1'});

    t.equal(notebook.validate({name: ''}).indexOf('name') > -1, true,
        'name cannot be empty');
    t.equal(notebook.validate({name: 'Test'}), undefined,
        'returns undefined if name is not empty');

    t.equal(notebook.validate({parentId: '1'}).indexOf('parentId') > -1, true,
        'cannot have itself as a parent');

    t.end();
});
