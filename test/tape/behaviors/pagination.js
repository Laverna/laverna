/**
 * Test behaviors/Pagination.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../app/scripts/utils/underscore';

import Pagination from '../../../app/scripts/behaviors/Pagination';
import Notes from '../../../app/scripts/collections/Notes';

let sand;
test('behaviors/Pagination: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Pagination: ui()', t => {
    const ui = Pagination.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.pageNav, '#pageNav');
    t.equal(ui.prevPage, '#prevPage');
    t.equal(ui.nextPage, '#nextPage');

    t.end();
});

test('Pagination: events()', t => {
    const events = Pagination.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['click @ui.nextPage'], 'getNextPage',
        'opens the next page if the next button is clicked');
    t.equal(events['click @ui.prevPage'], 'getPreviousPage',
        'opens the previous page if the previous button is clicked');

    t.end();
});

test('Pagination: collectionEvents()', t => {
    const events = Pagination.prototype.collectionEvents();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events.reset, 'updatePaginationButtons',
        'updates pagination buttons if the collection is reset');

    t.end();
});

test('Pagination: initialize()', t => {
    const page = Pagination.prototype;
    page.view  = {options: {collection: new Notes()}};
    const list = sand.stub(page, 'listenTo');

    page.initialize();
    t.equal(page.options, page.view.options, 'uses options from the view');
    t.equal(page.collection, page.view.options.collection,
        'uses collection from the view');

    const {collection} = page.view.options;
    t.equal(list.calledWith(collection.channel, 'page:next', page.getNextPage),
        true, 'listens to page:next event on collection channel');
    t.equal(list.calledWith(collection.channel, 'page:previous', page.getPreviousPage),
        true, 'listens to page:previous event on collection channel');

    page.view       = null;
    page.collection = null;
    page.options    = null;
    t.end();
});

test('Pagination: updatePaginationButtons()', t => {
    const page = Pagination.prototype;
    page.oldUi = page.ui;
    page.ui    = {
        pageNav  : {toggleClass : sinon.stub()},
        prevPage : {toggleClass : sinon.stub()},
        nextPage : {toggleClass : sinon.stub()},
    };
    page.collection = new Notes();
    page.collection.pagination.total = 10;

    page.updatePaginationButtons();
    t.equal(page.ui.pageNav.toggleClass.calledWith('hidden', false), true,
        'toggles "hidden" class of the pagination button group');
    t.equal(page.ui.prevPage.toggleClass.calledWith('disabled'), true,
        'toggles "disabled" class of the "previous" button');
    t.equal(page.ui.nextPage.toggleClass.calledWith('disabled'), true,
        'toggles "disabled" class of the "next" button');

    page.collection.pagination.total = 0;
    page.updatePaginationButtons();
    t.equal(page.ui.pageNav.toggleClass.calledWith('hidden', true), true,
        'hides all pagination buttons if the total number of models is equal to 0');

    page.ui = page.oldUi;
    sand.restore();
    t.end();
});

test('Pagination: getNextPage()', t => {
    const page      = Pagination.prototype;
    page.collection = new Notes();

    sand.stub(page.collection, 'hasNextPage').returns(false);
    sand.stub(page, 'navigatePage');
    sand.stub(page.collection, 'getNextPage');

    page.getNextPage();
    t.equal(page.navigatePage.notCalled, true,
        'does nothing if the collection does not have any next pages left');

    page.collection.hasNextPage.returns(true);
    page.getNextPage();
    t.equal(page.navigatePage.calledWith(1), true, 'calls navigatePage method');
    t.equal(page.collection.getNextPage.called, true,
        'calls getNextPage method');

    sand.restore();
    page.collection = null;
    t.end();
});

test('Pagination: getPreviousPage()', t => {
    const page      = Pagination.prototype;
    page.collection = new Notes();

    sand.stub(page.collection, 'hasPreviousPage').returns(false);
    sand.stub(page, 'navigatePage');
    sand.stub(page.collection, 'getPreviousPage');

    page.getPreviousPage();
    t.equal(page.navigatePage.notCalled, true,
        'does nothing if the collection does not have any next pages left');

    page.collection.hasPreviousPage.returns(true);
    page.getPreviousPage();
    t.equal(page.navigatePage.calledWith(-1), true, 'calls navigatePage method');
    t.equal(page.collection.getPreviousPage.called, true,
        'calls getPreviousPage method');

    sand.restore();
    page.collection = null;
    t.end();
});

test('Pagination: navigatePage()', t => {
    const page      = Pagination.prototype;
    page.options    = {filterArgs: {page: 10}};
    page.collection = new Notes();
    page.collection.pagination.current = 8;

    const request = sand.stub(Radio, 'request');
    page.navigatePage(1);
    t.equal(request.calledWithMatch('utils/Url', 'navigate', {
        trigger    : false,
        filterArgs : {page: 9},
    }), true, 'makes a navigate request');

    page.options    = null;
    page.collection = null;
    sand.restore();
    t.end();
});
