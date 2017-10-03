/**
 * @file Test collections/Notebooks
 */
import test from 'tape';
import sinon from 'sinon';
import Notebooks from '../../../app/scripts/collections/Notebooks';
import Pageable from '../../../app/scripts/collections/Pageable';
import Notebook from '../../../app/scripts/models/Notebook';

let sand;
test('collections/Notebooks: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/Notebooks: model', t => {
    const notebooks = new Notebooks();
    t.equal(notebooks.model, Notebook, 'uses notebook model');
    t.end();
});

test('collections/Notebooks: conditions', t => {
    const conditions = new Notebooks().conditions;
    t.equal(typeof conditions, 'object', 'is an object');
    t.deepEqual(conditions.active, {trash: 0});
    t.end();
});

test('collections/Notebooks: comparators', t => {
    t.equal(typeof new Notebooks().comparators, 'object', 'is an object');
    t.equal(new Notebooks().comparators.name, 'desc', 'uses default comparators');

    const opt = {sortField: 'created', sortDirection: 'asc'};
    t.equal(new Notebooks(null, opt).comparators.created, 'asc',
        'uses options');

    t.end();
});

test('collections/Notebooks: constructor()', t => {
    const notebooks = new Notebooks();
    t.equal(notebooks.pagination.perPage, 0, 'disables pagination');
    t.end();
});

test('collections/Notebooks: startListening()', t => {
    const stub      = sand.stub(Pageable.prototype, 'startListening');
    const notebooks = new Notebooks();
    const listen    = sand.stub(notebooks, 'listenTo');

    notebooks.startListening();
    t.equal(listen.calledWith(notebooks, 'change:parentId', notebooks.updateTree),
        true, 're-sorts the collection if a model\'s parentId changes');
    t.equal(stub.called, true, 'calls the parent method');

    sand.restore();
    t.end();
});

test('collections/Notebooks: getTree()', t => {
    const models = [
        {id: '1', parentId: '0'}, {id: '2', parentId: '0'},
        {id: '3', parentId: '1'}, {id: '4', parentId: '3'},
        {id: '5', parentId: '0'}, {id: '6', parentId: '0'},
    ];
    const notebooks = new Notebooks(models);
    sand.spy(notebooks, 'getRoots');
    sand.spy(notebooks, 'getChildren');

    const set = sand.stub(Notebooks.prototype.model.prototype, 'set');
    const res = notebooks.getTree();

    t.equal(notebooks.getRoots.called, true, 'gets only root notebooks first');
    t.equal(notebooks.getChildren.called, true, 'includes children of a notebook');
    t.equal(set.calledWith('level', 1), true, 'sets the nest level of a notebook model');
    t.equal(set.calledWith('level', 2), true, 'sets the nest level of a notebook model');

    t.equal(Array.isArray(res), true, 'is an array');
    t.equal(res.length, models.length, 'has the same amount of models');

    const index1 = notebooks.indexOf(notebooks.get('1'));
    t.equal(res[index1 + 1].id, '3',
        'child model is placed immediately after the parent');
    t.equal(res[index1 + 2].id, '4',
        'child model\'s children are placed immediately after');

    sand.restore();
    t.end();
});

test('collections/Notebooks: getRoots()', t => {
    const notebooks = new Notebooks([
        {id: '1', parentId: '0'}, {id: '2', parentId: '1'},
    ]);

    const spy = sand.spy(notebooks, 'where');
    const res = notebooks.getRoots();

    t.equal(Array.isArray(res), true, 'is an array');
    t.equal(spy.called, true, 'calls where method');
    t.equal(res.length, 1, 'is not an empty array');
    t.equal(res[0].get('parentId'), '0');

    sand.restore();
    t.end();
});

test('collections/Notebooks: getChildren()', t => {
    const notebooks = new Notebooks([
        {id: '1', parentId: '0'}, {id: '2', parentId: '1'},
        {id: '3', parentId: '1'}, {id: '4', parentId: '2'},
    ]);

    const spy = sand.spy(notebooks, 'where');
    const res = notebooks.getChildren('1');

    t.equal(spy.called, true, 'calls where method');
    t.equal(Array.isArray(res), true, 'is an array');
    t.equal(res.length, 2, 'is not an empty array');
    t.equal(res[0].get('parentId'), '1');
    t.equal(res[1].get('parentId'), '1');

    sand.restore();
    t.end();
});

test('collections/Notebooks: rejectTree()', t => {
    const notebooks = new Notebooks([
        {id: '1', parentId: '0'}, {id: '2', parentId: '0'},
        {id: '3', parentId: '1'}, {id: '4', parentId: '3'},
    ]);

    const spy = sand.spy(notebooks, 'filter');
    const res = notebooks.rejectTree('1');

    t.equal(spy.called, true, 'calls filter method');
    t.equal(Array.isArray(res), true, 'is an array');
    t.equal(res.length, 1, 'is not an empty array');
    t.equal(res[0].id, '2', 'returns a model that is not related to the specified model');

    sand.restore();
    t.end();
});

test('collections/Notebooks: after()', t => {
    sand.restore();
    t.end();
});
