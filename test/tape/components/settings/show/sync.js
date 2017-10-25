/**
 * Test components/settings/show/sync/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/sync/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/sync/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/sync/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/sync/View: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object');
    t.equal(regions.content, '#sync--content');
    t.end();
});

test('settings/show/sync/View: onRender()', t => {
    const view = new View();
    sand.stub(view, 'showSyncView');

    view.onRender();
    t.equal(view.showSyncView.called, true, 'renders a sync adapter view');

    sand.restore();
    t.end();
});

test('settings/show/sync/View: showUsers()', t => {
    const view = new View();
    view.ui    = {sync: {val: () => 'p2p'}};
    sand.stub(view, 'showUsers');
    sand.stub(view, 'showSync');

    view.showSyncView();
    t.equal(view.showSync.notCalled, true, 'does not call showSync()');
    t.equal(view.showUsers.called, true, 'shows a list of trusted users (p2p)');

    view.ui.sync.val = () => 'dropbox';
    view.showSyncView();
    t.equal(view.showSync.calledWith('dropbox'), true, 'shows a sync adapter view');
    t.equal(view.showUsers.callCount, 1, 'does not call showUsers()');

    sand.restore();
    t.end();
});

test('settings/show/sync/View: showUsers()', t => {
    const view = new View();
    sand.stub(view, 'showChildView');

    view.showUsers();
    t.equal(view.showChildView.calledWith('content'), true);

    sand.restore();
    t.end();
});

test('settings/show/sync/View: showSync()', t => {
    const view     = new View({collection: new Configs()});
    const SyncView = sand.stub();

    const show = sand.stub(view, 'showChildView');
    const req  = sand.stub(Radio, 'request')
    .withArgs('components/dropbox', 'getSettingsView')
    .returns(SyncView);

    view.showSync('dropbox');
    t.equal(SyncView.calledWith({collection: view.collection}), true,
        'instantiates the view');
    t.equal(show.calledWith('content'), true, 'renders the view in "content" region');

    const empty = sand.stub();
    sand.stub(view, 'getRegion').withArgs('content').returns({empty});
    view.showSync('sync');
    t.equal(empty.called, true, 'empties "content" region');
    t.equal(show.callCount, 1, 'calls showChildView() only 1 time');

    sand.restore();
    t.end();
});

test('settings/show/sync/View: serializeData()', t => {
    const view = new View({collection: new Configs()});
    t.deepEqual(view.serializeData(), {
        models: {},
    });
    t.end();
});
