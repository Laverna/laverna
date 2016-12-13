/**
 * Test components/electronSearch/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import '../../../../app/scripts/utils/underscore';

import View from '../../../../app/scripts/components/electronSearch/View';

let sand;
test('electronSearch/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('electronSearch/View: className', t => {
    t.equal(View.prototype.className, 'electron--search');
    t.end();
});

test('electronSearch/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.search, '[name="text"]');
    t.end();
});

test('electronSearch/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');

    t.equal(events['input @ui.search'], 'onInput');
    t.equal(events['submit form'], 'next');
    t.equal(events['click #search--next'], 'next', 'finds the next occurence');
    t.equal(events['click #search--prev'], 'previous', 'finds the previous occurence');

    t.equal(events['keyup @ui.search'], 'destroyOnEsc',
        'destroyes itself if escape is pressed');
    t.equal(events['click .search--close'], 'destroy',
        'destroyes itself if the close button is clicked');

    t.end();
});

test('electronSearch/View: constructor()', t => {
    window.requireNode = sand.stub().returns({remote: {}});
    const view = new View();

    t.equal(window.requireNode.calledWith('electron'), true,
        'imports electron');
    t.equal(typeof view.remote, 'object', 'creates "remote" property');

    sand.restore();
    t.end();
});

test('electronSearch/View: onReady()', t => {
    const view = new View();
    view.ui    = {search: {focus: sand.stub()}};

    view.onReady();
    t.equal(view.ui.search.focus.called, true, 'focuses on the search input');

    sand.restore();
    t.end();
});

test('electronSearch/View: onDestroy()', t => {
    const stopFindInPage = sand.stub();
    const view  = new View();
    view.remote = {
        getCurrentWindow: sand.stub().returns({webContents: {stopFindInPage}}),
    };

    view.destroy();
    t.equal(stopFindInPage.calledWith('clearSelection'), true,
        'clears search highlights');

    sand.restore();
    t.end();
});

test('electronSearch/View: onInput()', t => {
    const view  = new View();
    sand.stub(view, 'search');
    const once  = sand.stub();
    view.remote = {
        getCurrentWindow: sand.stub().returns({webContents: {once}}),
    };

    t.equal(view.onInput(), true, 'returns true to allow change');
    t.equal(view.search.called, true, 'calls "search" method');
    t.equal(once.calledWith('found-in-page'), true,
        'listens to found-in-page event');

    sand.restore();
    t.end();
});

test('electronSearch/View: search()', t => {
    const view = new View();
    view.ui    = {search: {val: () => ''}};

    const findInPage = sand.stub();
    view.remote      = {
        getCurrentWindow: sand.stub().returns({webContents: {findInPage}}),
    };

    view.search();
    t.equal(findInPage.notCalled, true, 'does nothing if the keyword is empty');

    view.ui.search.val = () => 'test';
    view.search(true);
    t.equal(findInPage.calledWith('test', {forward: false}), true,
        'finds the previous item');

    view.ui.search.val = () => 'word';
    view.search();
    t.equal(findInPage.calledWith('word'), true,
        'finds the next item');

    sand.restore();
    t.end();
});

test('electronSearch/View: next() + previous()', t => {
    const view = new View();
    sand.stub(view, 'search');

    t.equal(view.next(), false, 'returns false');
    t.equal(view.search.called, true, 'calls "search" method');

    t.equal(view.previous(), false, 'returns false');
    t.equal(view.search.calledWith(true), true, 'calls "search" method');

    sand.restore();
    t.end();
});

test('electronSearch/View: destroyOnEsc()', t => {
    const view = new View();
    sand.stub(view, 'destroy');

    view.destroyOnEsc({keyCode: 2});
    t.equal(view.destroy.notCalled, true, 'does nothing if it is not escape key');

    view.destroyOnEsc({keyCode: 27});
    t.equal(view.destroy.called, true, 'destroyes itself if it i escape key');

    sand.restore();
    t.end();
});
