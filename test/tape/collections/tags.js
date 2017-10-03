/**
 * @file Test collections/Tags
 */
import test from 'tape';
import Tags from '../../../app/scripts/collections/Tags';
import Tag from '../../../app/scripts/models/Tag';

test('collections/Tags: model', t => {
    const tags = new Tags();
    t.equal(tags.model, Tag, 'uses tag model');
    t.end();
});

test('collections/Tags: comparators', t => {
    const tags = new Tags();
    t.equal(typeof tags.comparators, 'object');
    t.equal(tags.comparators.created, 'desc');
    t.end();
});

test('collections/Tags: conditions', t => {
    const tags = new Tags();
    t.equal(typeof tags.conditions, 'object');
    t.deepEqual(tags.conditions.active, {trash: 0});
    t.end();
});

test('collections/Tags: constructor()', t => {
    t.equal(new Tags().pagination.perPage, 20, 'uses the default perPage settings');
    t.equal(new Tags(null, {perPage: 12}).pagination.perPage, 12,
        'uses the perPage option');
    t.end();
});

test('collections/Tags: getPage()', t => {
    const tags          = new Tags();
    tags.fullCollection = tags.clone();

    for (let i = 0; i < 60; i++) {
        tags.fullCollection.add({id: i.toString()});
    }

    const res = tags.getPage(0);
    t.equal(Array.isArray(res), true, 'returns an array');

    // The number of models increases
    t.equal(res.length, 20);
    t.equal(tags.getPage(2).length, 40);
    t.equal(tags.getPage(3).length, 60);

    t.end();
});

test('collections/Tags: hasPreviousPage()', t => {
    const tags = new Tags();
    t.equal(tags.hasPreviousPage(), false, 'returns false');
    t.end();
});
