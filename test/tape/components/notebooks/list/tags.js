/**
 * Test components/notebooks/list/views/Tags
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/notebooks/list/views/Tags';
import Tag from '../../../../../app/scripts/components/notebooks/list/views/Tag';
import Navigate from '../../../../../app/scripts/behaviors/Navigate';
import Tags from '../../../../../app/scripts/collections/Tags';
/* eslint-enable */

test('tags/list/views/Tags: className', t => {
    t.equal(View.prototype.className, 'list list--tags');
    t.end();
});

test('tags/list/views/Tags: behaviors()', t => {
    const behaviors = View.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Navigate) !== -1, true, 'uses navigate behavior');
    t.end();
});

test('tags/list/views/Tags: childView()', t => {
    t.equal(View.prototype.childView(), Tag, 'uses tags item view');
    t.end();
});

test('tags/list/views/Tags: childViewOptions()', t => {
    const view = new View({profileId: 'test', collection: 'test'});
    t.deepEqual(view.childViewOptions(), {profileId: 'test', filterArgs: {}}, 'msg');
    t.end();
});

test('tags/list/views/Tags: initialize()', t => {
    const listen = sinon.stub(View.prototype, 'listenTo');
    const view   = new View({collection: new Tags()});

    t.equal(_.isEmpty(view.options.filterArgs), true,
        'creates options.filterArgs property');
    t.equal(listen.calledWith(view.collection.channel, 'page:next', view.getNextPage),
        true, 'listens to page:next event');

    listen.restore();
    view.destroy();
    t.end();
});

test('tags/list/views/Tags: getNextPage()', t => {
    const view    = new View({collection: new Tags()});
    const getNext = sinon.stub(view.collection, 'getNextPage');

    view.getNextPage();
    t.equal(view.collection.pagination.current, 1, 'increments the pagination number');
    t.equal(getNext.called, true, 'calls collection.getNextPage method');

    view.getNextPage();
    t.equal(view.collection.pagination.current, 2, 'increments the pagination number');

    getNext.restore();
    t.end();
});
