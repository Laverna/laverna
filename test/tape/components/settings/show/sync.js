/**
 * Test components/settings/show/sync/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

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
    t.equal(regions.users, '#sync--users');
    t.end();
});

test('settings/show/sync/View: onRender()', t => {
    const view = new View();
    sand.stub(view, 'showUsers');

    view.onRender();
    t.equal(view.showUsers.called, true, 'shows a list of users');

    sand.restore();
    t.end();
});

test('settings/show/sync/View: showUsers()', t => {
    const view = new View();
    sand.stub(view, 'showChildView');

    view.showUsers();
    t.equal(view.showChildView.calledWith('users'), true);

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
