/**
 * @file Test collections/Notes
 */
import test from 'tape';
import sinon from 'sinon';
import Notes from '../../../app/scripts/collections/Notes';
import Note from '../../../app/scripts/models/Note';

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Sed maximus sem nisi, quis semper erat mollis quis. Nam ultrices
    dolor et magna ullamcorper euismod.`;

let sand;
test('collections/Notes: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/Notes: model', t => {
    const notes = new Notes();
    t.equal(notes.model, Note, 'uses note model');
    t.end();
});

test('collections/Notes: conditions', t => {
    const conditions = new Notes().conditions;

    t.equal(typeof conditions, 'object', 'is an object');
    t.deepEqual(conditions.active, {trash: 0});
    t.deepEqual(conditions.favorite, {isFavorite: 1, trash: 0});
    t.deepEqual(conditions.trashed, {trash: 1});
    t.equal(typeof conditions.notebook, 'function');
    t.deepEqual(conditions.notebook({query: '1'}), {notebookId: '1', trash: 0});

    t.end();
});

test('collections/Notes: comparators', t => {
    const comparators = new Notes().comparators;

    t.equal(typeof comparators, 'object', 'is an object');
    t.equal(comparators.created, 'desc', 'uses the default comparator');
    t.equal(comparators.isFavorite, 'desc', 'uses isFavorite comparator');

    const notes = new Notes(null, {sortField: 'updated', sortDirection: 'asc'});
    t.equal(notes.comparators.updated, 'asc', 'uses options');
    t.equal(notes.comparators.isFavorite, 'desc');

    t.end();
});

test('collections/Notes: constructor()', t => {
    t.equal(new Notes().pagination.perPage, 10,
        'changes the number of models shown per page');

    t.equal(new Notes(null, {perPage: 11}).pagination.perPage, 11,
        'uses perPage parameter');

    t.end();
});

test('collections/Notes: taskFilter()', t => {
    const notes = new Notes([
        {id: '1', taskCompleted: 10, taskAll: 10},
        {id: '2', taskCompleted: 1, taskAll: 10},
        {id: '3', taskCompleted: 9, taskAll: 10},
    ]);
    const res = notes.taskFilter();
    t.equal(Array.isArray(res), true, 'is an array');
    t.equal(res.length, 2, 'returns only notes that have unfinished tasks');

    t.end();
});

test('collections/Notes: tagFilter', t => {
    const notes = new Notes([
        {id: '1', tags: ['test', 'testTag'], trash: 0},
        {id: '2', tags: ['test'], trash: 0},
        {id: '3', tags: ['testTag'], trash: 1},
        {id: '4', trash: 1},
    ]);

    const res = notes.tagFilter('testTag');
    t.equal(Array.isArray(res), true, 'returns an array');
    t.equal(res.length, 1, 'returns only notes that are associated with the tag');

    t.end();
});

test('collections/Notes: searchFilter()', t => {
    const notes = new Notes([
        {id: '1', title: 'Test 1', content: `${lorem} search content`},
        {id: '2', title: 'Test 2', content: `${lorem} find this`},
        {id: '3', title: 'Test this', content: `${lorem} this is test`},
        {id: '4', title: 'Test 4', content: `${lorem} search`},
    ]);

    t.equal(Array.isArray(notes.searchFilter('test 1')), true,
        'returns an array');
    t.equal(notes.searchFilter('test 1').length, 1);

    t.equal(notes.searchFilter('search content').length, 1,
        'searches in the content attribute too');

    t.end();
});

test('collections/Notes: fuzzySearch()', t => {
    const notes = new Notes([
        {id: '1', title: 'The Great Gatsby. Test'},
        {id: '2', title: 'The DaVinci Code. Test'},
        {id: '3', title: 'Angels & Demons'},
    ]);
    notes.fullCollection = notes.clone();

    t.equal(Array.isArray(notes.fuzzySearch('gaby')), true,
        'returns an array');
    t.equal(notes.fuzzySearch('gaby').length, 1);
    t.equal(notes.fuzzySearch('tst').length, 2);

    t.end();
});

test('collections/Notes: after()', t => {
    sand.restore();
    t.end();
});
