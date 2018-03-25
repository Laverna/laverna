/**
 * Test models/Note
 * @file
 */
import test from 'tape';
import Note from '../../../app/scripts/models/Note';

test('Note: storeName', t => {
    const note = new Note();
    t.equal(note.storeName, 'notes');
    t.end();
});

test('Note: defaults', t => {
    const defaults = new Note().defaults;

    t.equal(defaults.type, 'notes');
    t.equal(defaults.id, undefined);
    t.equal(defaults.title, '');
    t.equal(defaults.content, '');
    t.equal(defaults.notebookId, '0');
    t.equal(Array.isArray(defaults.tags), true);
    t.equal(Array.isArray(defaults.files), true);
    t.equal(Array.isArray(defaults.sharedWith), true);
    t.equal(defaults.sharedBy, '');

    const attrs = 'taskAll,taskCompleted,created,updated,isFavorite,trash';
    attrs.split(',').forEach(attr => {
        t.equal(defaults[attr], 0);
    });

    t.end();
});

test('Note: encryptKeys()', t => {
    const encryptKeys = new Note().encryptKeys;
    t.equal(Array.isArray(encryptKeys), true, 'is an array');
    t.equal(encryptKeys.indexOf('title') > -1, true, 'encrypts title');
    t.equal(encryptKeys.indexOf('content') > -1, true, 'encrypts content');
    t.equal(encryptKeys.indexOf('tags') > -1, true, 'encrypts tags');
    t.equal(encryptKeys.indexOf('tasks') > -1, true, 'encrypts tasks');
    t.end();
});

test('Note: validateAttributes()', t => {
    const validate = new Note().validateAttributes;
    t.equal(Array.isArray(validate), true, 'is an array');
    t.equal(validate.indexOf('title') > -1, true, 'validates title');
    t.end();
});

test('Note: escapeAttributes()', t => {
    const escape = new Note().escapeAttributes;
    t.equal(Array.isArray(escape), true, 'is an array');
    t.equal(escape.indexOf('title') > -1, true, 'filters title');
    t.equal(escape.indexOf('content') > -1, true, 'filters content');
    t.equal(escape.indexOf('sharedBy') > -1, true, 'filters sharedBy');
    t.end();
});

test('Note: validate()', t => {
    const note = new Note({id: '1'});

    t.equal(note.validate({title: ''}).indexOf('title') > -1, true,
        'title cannot be empty');
    t.equal(note.validate({title: 'Test'}), undefined,
        'returns undefined if title is not empty');

    t.end();
});

test('Note: toggleFavorite()', t => {
    const note = new Note({id: '1', isFavorite: 1});

    note.toggleFavorite();
    t.equal(note.get('isFavorite'), 0,
        'changes favorite status to 0 if it is equal to 1');

    note.toggleFavorite();
    t.equal(note.get('isFavorite'), 1,
        'changes favorite status to 1 if it is equal to 0');

    t.end();
});
