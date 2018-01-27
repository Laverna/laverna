/**
 * @file Test collections/Collection
 */
import test from 'tape';
import sinon from 'sinon';
import '../../../app/scripts/utils/underscore';
import Collection from '../../../app/scripts/collections/Collection';
import Note from '../../../app/scripts/models/Note';

let sand;
test('collections/Collection: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/Collection: sync', t => {
    const coll = new Collection();
    t.equal(typeof coll.sync, 'function', 'has sync method');
    t.end();
});

test('collections/Collection: profileId', t => {
    t.equal(new Collection().profileId, undefined, 'is equal to "undefined"');

    const coll = new Collection(null, {profileId: 'default'});
    t.equal(coll.profileId, 'default', 'changes the profileId');
    t.equal(coll.model.prototype._profileId, 'default', 'changes model\'s profileId');

    t.end();
});

test('collections/Collection: profileId - can change', t => {
    const coll = new Collection();
    coll.model = Note.extend({});

    coll.profileId = 'testing';
    t.equal(coll.profileId, 'testing', 'changes a collection\'s profileId');
    t.equal(coll.model.prototype.profileId, 'testing',
        'changes a models\'s profileId');

    delete coll.model;
    t.end();
});

test('collections/Collection: storeName', t => {
    const coll = new Collection();
    coll.model = Note.extend({});

    t.equal(typeof coll.storeName, 'string');
    t.equal(coll.storeName, 'notes');

    delete coll.model;
    t.end();
});

test('collections/Collection: channel', t => {
    const coll = new Collection();
    coll.model = Note.extend({});
    t.equal(coll.channel, coll.model.prototype.channel);
    t.end();
});

test('collections/Collection: filterList()', t => {
    const coll      = new Collection();
    coll.testFilter = sand.stub().returns([]);

    sand.stub(coll, 'getCondition').returns({trash: 0});
    sand.spy(coll, 'where');
    sand.spy(coll, 'reset');

    t.equal(coll.filterList({filter: 'active'}), coll, 'returns itself');
    t.equal(coll.where.calledWithMatch({trash: 0}), true, 'filters the collection');
    t.equal(coll.reset.called, true, 'resets the collection');

    coll.getCondition.returns(null);
    t.equal(coll.filterList({filter: 'test', query: '1'}), coll, 'returns itself');
    t.equal(coll.testFilter.called, true, 'calls "testFilter" method');

    sand.restore();
    t.end();
});

test('collections/Collection: getCondition()', t => {
    const coll      = new Collection();
    coll.conditions = {active: {trash: 0}};

    t.deepEqual(coll.getCondition({filter: 'active'}), {trash: 0});
    t.equal(coll.conditionFilter, 'active', 'creates "conditionFilter" property');
    t.deepEqual(coll.currentCondition, {trash: 0},
        'creates "currentCondition" property');

    t.deepEqual(coll.getCondition({conditions: {trash: 1}}), {trash: 1},
        'uses "conditions" option');

    sand.restore();
    t.end();
});

test('collections/Collection: findOrCreate()', t => {
    const coll      = new Collection();
    coll.add({id: 1});
    sand.spy(coll, 'add');

    t.equal(typeof coll.findOrCreate(2), 'object', 'returns an object');
    t.equal(coll.findOrCreate(3).get('id'), 3, 'creates a new model');
    t.equal(coll.findOrCreate(1), coll.get(1), 'finds the model in the collection');
    t.equal(coll.add.called, true, 'adds the new model to the collection');

    t.end();
});
