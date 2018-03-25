/**
 * @file Test collections/Pageable
 */
import test from 'tape';
import sinon from 'sinon';
import _ from 'underscore';
import Pageable from '../../../app/scripts/collections/Pageable';
import Collection from '../../../app/scripts/collections/Collection';
import Note from '../../../app/scripts/models/Note';
import '../../../app/scripts/utils/underscore';

let sand;
test('collections/Pageable: before()', t => {
    Pageable.prototype.model = Note;
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/Pageable: channel', t => {
    const page = new Pageable();
    t.equal(typeof page.channel, 'object', 'is an object');
    t.equal(page.channel.channelName, 'collections/Notes',
        'has a channel name');
    t.end();
});

test('collections/Pageable: comparators', t => {
    const comparators = new Pageable().comparators;

    t.equal(typeof comparators, 'object', 'is an object');
    t.equal(comparators.isFavorite, 'desc', 'for default sorts by "isFavorite" field');
    t.equal(comparators.created, 'desc', 'for default sorts by "created" field');

    t.end();
});

test('collections/Pageable: pagination', t => {
    const pagination = new Pageable().pagination;

    t.equal(typeof pagination, 'object', 'is an object');
    t.equal(typeof pagination.perPage, 'number');
    t.equal(pagination.first, 0);
    t.equal(pagination.current, 0);
    t.equal(pagination.total, 0);

    t.end();
});

test('collections/Pageable: paginate()', t => {
    const page = new Pageable();

    // Create spies
    const sortSpy  = sand.spy(Pageable.prototype, 'sortByComparators');
    const totalSpy = sand.spy(page, 'updateTotalPages');
    const pageSpy  = sand.spy(page, 'getPage');

    page.pagination.perPage = 0;
    t.equal(page.paginate(), page, 'returns itself');
    t.equal(sortSpy.notCalled, true, 'does nothing if perPage is equal to 0');

    page.pagination.perPage = 10;
    t.equal(page.paginate(), page, 'returns itself');
    t.equal(typeof page.fullCollection, 'object', 'creates fullCollection property');

    page.paginate();
    t.equal(sortSpy.called, true, 'sorts full collection');
    t.equal(totalSpy.calledAfter(sortSpy), true, 'updates the total amount of pages');
    t.equal(pageSpy.calledAfter(totalSpy), true, 'creates pagination');
    t.equal(pageSpy.calledWith(page.pagination.current), true);

    sand.restore();
    page.stopListening();
    t.end();
});

test('collections/Pageable: startListening()', t => {
    const page      = new Pageable();
    const listenSpy = sand.spy(page, 'listenTo');

    t.equal(page.startListening(), page, 'returns itself');

    Object.keys(page.comparators).forEach(field => {
        t.equal(listenSpy.calledWith(page, `change:${field}`), true,
            `listens to ${field} comparator field changes`);
    });

    t.equal(listenSpy.calledWith(page.channel), true,
        'listens to Radio channel events');

    // Listens to Radio events
    ['save:model', 'destroy:model', 'restore:model'].forEach(event => {
        t.equal(listenSpy.calledWith(page.channel, event), true,
            `listens to "${event}" event on Radio channel`);
    });

    page.stopListening();
    sand.restore();
    t.end();
});

test('collections/Pageable: removeEvents()', t => {
    const page          = new Pageable();
    page.fullCollection = page.clone();

    const resetSpy = sand.spy(page.fullCollection, 'reset');
    const stopSpy  = sand.spy(page, 'stopListening');

    t.equal(page.removeEvents(), page, 'returns itself');
    t.equal(resetSpy.called, true, 'resets full collection');
    t.equal(stopSpy.called, true, 'stops listening to events');

    sand.restore();
    t.end();
});

test('collections/Pageable: onUpdateModel()', t => {
    const page  = new Pageable();
    const model = new Note();

    model.profileId = 'testing';
    t.equal(page.onUpdateModel({model}), undefined,
        'does nothing if the model has a different profile ID');

    sand.restore();
    t.end();
});

test('collections/Pageable: onUpdateModel() -> onDestroyModel()', t => {
    const page  = new Pageable();
    const model = new Note({trash: 1});

    const destroySpy = sand.spy(page, 'onDestroyModel');

    page.onUpdateModel({model});
    t.equal(destroySpy.called, true,
        'removes the model from the collection if it does not meet filter condition');

    sand.restore();
    t.end();
});

test('collections/Pageable: onUpdateModel() -> updateCollectionModel()', t => {
    const page  = new Pageable();
    const model = new Note();

    const updateSpy = sand.stub(page, 'updateCollectionModel');
    page.onUpdateModel({model});
    t.equal(updateSpy.called, true, 'executes updateCollectionModel method');

    sand.restore();
    t.end();
});

test('collections/Pageable: updateCollectionModel()', t => {
    const page = new Pageable();

    // Existing model
    page.add({id: 1, title: 'Test'});
    const setSpy = sand.spy(page.get(1), 'set');
    page.updateCollectionModel({model: {id: 1}});
    t.equal(setSpy.called, true, 'updates an existing model');

    // A new model
    const model   = new Note({id: 2, title: 'Test 2'});
    const pageSpy = sand.stub(page, 'paginate');
    page.updateCollectionModel({model});

    t.equal(typeof page.get(2), 'object', 'adds a new model to the collection');
    t.equal(pageSpy.called, true, 'updates pagination');

    sand.restore();
    t.end();
});

test('collections/Pageable: onDestroyModel()', t => {
    const page = new Pageable();

    t.equal(page.onDestroyModel({model: {id: 42}}), false,
        'does nothing if a model does not exist in the collection');

    page.add({id: 1});
    const pageSpy     = sand.stub(page, 'paginate');
    const navigateSpy = sand.stub(page, 'navigateOnRemove');
    page.onDestroyModel({model: {id: 1}});

    t.equal(typeof page.get(1), 'undefined', 'msg');
    t.equal(pageSpy.called, true, 'updates pagination');
    t.equal(navigateSpy.called, true, 'navigates to the previous model');

    sand.restore();
    t.end();
});

test('collections/Pageable: navigateOnRemove()', t => {
    const page    = new Pageable();
    const trigger = sand.spy(page.channel, 'trigger');

    for (let i = 0; i < 4; i++) {
        page.add({id: i});
    }

    page.navigateOnRemove(page.at(2));
    t.equal(trigger.calledWith('model:navigate', {model: page.at(2)}), true,
        'triggers "model:navigate" with a model');

    page.remove(page.at(4));
    page.navigateOnRemove(page.at(4));
    t.equal(trigger.calledWith('model:navigate', {model: page.at(3)}), true,
        'triggers "model:navigate" with the previous model');

    sand.restore();
    t.end();
});

test('collections/Pageable: navigateOnRemove() - navigate to the previous page', t => {
    const page    = new Pageable();
    const trigger = sand.spy(page.channel, 'trigger');
    sand.stub(page, 'hasPreviousPage').returns(false);

    page.reset([]);
    page.navigateOnRemove(page.at(0));
    t.equal(trigger.called, false,
        'does not trigger page:previous if there are not any previous page');

    page.hasPreviousPage.returns(true);
    page.navigateOnRemove(page.at(0));
    t.equal(trigger.calledWith('page:previous'), true,
        'triggers "page:previous" with a model');

    sand.restore();
    t.end();
});

test('collections/Pageable: onRestoreModel()', t => {
    const page  = new Pageable();
    const model = new Note();
    page.add([model, model.clone()]);

    const updateSpy = sand.stub(page, 'onUpdateModel');
    page.onRestoreModel({model});
    t.equal(updateSpy.calledWith({model}), true,
        'executes onUpdateModel() if the current condition is not equal to "trashed"');

    const destroySpy     = sand.stub(page, 'onDestroyModel');
    page.conditionFilter = 'trashed';
    page.onRestoreModel({model});
    t.equal(destroySpy.calledWith({model}), true,
        'executes onDestroyModel() if the current condition is equal to "trashed"');

    sand.restore();
    t.end();
});

test('collections/Pageable: sortByComparators() - desc', t => {
    const page = new Pageable();
    const sort = sand.spy(page, 'sort');
    page.reset([]);

    for (let i = 0; i <= 10; i++) {
        page.add(new Note({id: i, isFavorite: i, created: i}));
    }

    const res = page.sortByComparators();
    t.equal(Array.isArray(res), true, 'returns an array');
    t.equal(sort.calledTwice, true, 'sorts several times');

    _.forEach(res, (val, index) => {
        if (index === 0) {
            return;
        }

        t.equal(res[index - 1].get('isFavorite') >= val.get('isFavorite'), true,
            'sorts by "isFavorite" comparator');

        t.equal(res[index - 1].get('created') >= val.get('created'), true,
            'sorts by "created" comparator');
    });

    sand.restore();
    t.end();
});

test('collections/Pageable: sortByComparators() - asc', t => {
    const page = new Pageable();
    page.comparators = {
        isFavorite: 'asc',
        created   : 'asc',
    };

    for (let i = 10; i > 0; i--) {
        page.add(new Note({id: i, isFavorite: i, created: i}));
    }

    const res = page.sortByComparators();
    _.forEach(res, (val, index) => {
        if (index === 0) {
            return;
        }

        t.equal(res[index - 1].get('isFavorite') <= val.get('isFavorite'), true,
            'sorts by "isFavorite" comparator');

        t.equal(res[index - 1].get('created') <= val.get('created'), true,
            'sorts by "created" comparator');
    });

    t.end();
});

test('collections/Pageable: updateTotalPages()', t => {
    const page = new Pageable();

    const pages = Math.ceil(125 / page.pagination.perPage) - 1;
    page.fullCollection = {length: 125};
    t.equal(page.updateTotalPages(), pages, 'msg');

    t.end();
});

test('collections/Pageable: hasNextPage()', t => {
    const page = new Pageable();

    t.equal(page.hasNextPage(), false,
        'returns false if the current page number is equal to the total amount');

    page.pagination.total = 10;
    t.equal(page.hasNextPage(), true,
        'returns true if the current page number is not equal to the total amount');

    page.pagination.total = undefined;
    t.equal(page.hasNextPage(), false,
        'returns false if the total number is undefined');

    t.end();
});

test('collections/Pageable: hasPreviousPage()', t => {
    const page = new Pageable();

    t.equal(page.hasPreviousPage(), false,
        'returns false if the current page is the first page');

    page.pagination.current = 1;
    t.equal(page.hasPreviousPage(), true,
        'returns true if it is not the first page');

    t.end();
});

test('collections/Pageable: getNextPage() + getPreviousPage()', t => {
    const page  = new Pageable();
    const stub  = sand.stub(page, 'getPage').returns([{id: 'next'}]);
    const reset = sand.spy(page, 'reset');

    // Next page
    page.getNextPage();
    t.equal(stub.calledWith(page.pagination.current + 1), true,
        'executes getPage() to get models for the next page');
    t.equal(reset.calledWith([{id: 'next'}]), true, 'resets itself');

    // Previous page
    stub.returns([{id: 'previous'}]);
    page.getPreviousPage();
    t.equal(stub.calledWith(page.pagination.current - 1), true,
        'executes getPage() to get models for the previous page');
    t.equal(reset.calledWith([{id: 'previous'}]), true, 'resets itself');

    sand.restore();
    t.end();
});

test('collections/Pageable: getPage()', t => {
    const page   = new Pageable();
    const offset = sand.spy(page, 'getOffset');

    page.fullCollection = page.clone();
    const slice         = sand.spy(page.fullCollection.models, 'slice');

    page.getPage(1);
    t.equal(page.pagination.current, 1, 'updates the current page number');
    t.equal(offset.calledWith(1), true, 'calculates offset number');
    t.equal(slice.calledAfter(offset), true, 'slices models');

    sand.restore();
    t.end();
});

test('collections/Pageable: getOffset()', t => {
    const page = new Pageable();

    t.equal(page.getOffset(1), 1 * page.pagination.perPage);

    page.pagination.first = 1;
    t.equal(page.getOffset(1), 0 * page.pagination.perPage);

    t.end();
});

test('collections/Pageable: navigateNextModel()', t => {
    const page    = new Pageable();
    const trigger = sand.stub(page.channel, 'trigger');
    const hasNext = sand.stub(page, 'hasNextPage').returns(false);
    page.add([{id: '1'}, {id: '2'}]);

    // Does nothing
    hasNext.returns(false);
    page.navigateNextModel('2');
    t.equal(trigger.calledWith('page:end'), true,
        'triggers page:end event if there are no next pages left');

    // Navigate to the next model
    page.navigateNextModel('1');
    t.equal(trigger.calledWith('model:navigate', {model: page.get('2')}), true,
        'triggers model:navigate event if it is not the last model on the page');

    page.navigateNextModel('3');
    t.equal(trigger.calledWith('model:navigate', {model: page.at(0)}), true,
        `triggers model:navigate with the first model if a model with
        the specified ID does not exist`);

    // Navigate to the next page
    hasNext.returns(true);
    page.navigateNextModel('2');
    t.equal(trigger.calledWith('page:next'), true,
        'triggers page:next event if it is the last model and there is the next page');

    sand.restore();
    t.end();
});

test('collections/Pageable: navigatePreviousModel()', t => {
    const page        = new Pageable();
    const trigger     = sand.stub(page.channel, 'trigger');
    const hasPrevious = sand.stub(page, 'hasPreviousPage').returns(false);
    page.add([{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]);

    // Does nothing
    hasPrevious.returns(false);
    page.navigatePreviousModel('1');
    t.equal(trigger.calledWith('page:start'), true, `triggers page:start event
        if it is the first model and there are not previous pages left`);

    // Navigate to the previous model
    page.navigatePreviousModel('3');
    t.equal(trigger.called, true, 'navigate');
    t.equal(trigger.calledWith('model:navigate', {model: page.get('2')}), true,
        'triggers model:navigate event if it is not the first model on the page');

    page.navigatePreviousModel('5');
    t.equal(trigger.calledWith('model:navigate', {model: page.get('4')}), true,
        `triggers model:navigate with the last model if a model with
        the specified ID does not exist`);

    // Navigate to the previous page
    hasPrevious.returns(true);
    page.navigatePreviousModel('1');
    t.equal(trigger.calledWith('page:previous'), true,
        'triggers page:previous event if it is the first model');

    sand.restore();
    t.end();
});

test('collections/Pageable: after()', t => {
    delete Pageable.prototype.model;
    sand.restore();
    t.end();
});
