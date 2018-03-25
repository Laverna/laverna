/**
 * Test components/notes/list/views/Layout.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import Layout from '../../../../../app/scripts/components/notes/list/views/Layout';
import Pagination from '../../../../../app/scripts/behaviors/Pagination';
import Sidebar from '../../../../../app/scripts/behaviors/Sidebar';
import NotesView from '../../../../../app/scripts/components/notes/list/views/NotesView';

global.overrideTemplate(Layout, 'components/notes/list/templates/layout.html');

let sand;
test('notes/list/views/Layout: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/list/views/Layout: behaviors()', t => {
    const behaviors = Layout.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Pagination) > -1, true, 'uses pagination behavior');
    t.equal(behaviors.indexOf(Sidebar) > -1, true, 'uses sidebar behavior');
    t.end();
});

test('notes/list/views/Layout: regions()', t => {
    const regions = Layout.prototype.regions();
    t.equal(typeof regions, 'object', 'returns an object');
    t.equal(regions.notes, '.list', 'has notes region');
    t.end();
});

test('notes/list/views/Layout: onRender()', t => {
    const view = new Layout({collection: {channel: {}}});
    const stub = sand.stub(view, 'showChildView');
    sand.stub(NotesView.prototype, 'behaviors').returns([]);

    view.onRender();
    t.equal(stub.calledWith('notes'), true, 'renders the collection view');

    sand.restore();
    t.end();
});

test('notes/list/views/Layout: templateContext()', t => {
    const view      = new Layout({collection: {channel: {}}});
    view.collection = {models: []};
    const context   = view.templateContext();

    t.equal(typeof context, 'object', 'returns an object');
    t.equal(context.collection, view.collection, 'uses the collection property');

    t.end();
});
