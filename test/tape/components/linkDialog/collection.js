/**
 * Test components/linkDialog/views/Collection
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import View from '../../../../app/scripts/components/linkDialog/views/Collection';
import Item from '../../../../app/scripts/components/linkDialog/views/Item';

let sand;
test('linkDialog/views/Collection: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('linkDialog/views/Collection: tagName', t => {
    t.equal(View.prototype.tagName, 'ul');
    t.end();
});

test('linkDialog/views/Collection: className', t => {
    t.equal(View.prototype.className, 'dropdown-menu');
    t.end();
});

test('linkDialog/views/Collection: childViewContainer', t => {
    t.equal(View.prototype.childViewContainer, '.dropdown-menu');
    t.end();
});

test('linkDialog/views/Collection: childView', t => {
    t.equal(View.prototype.childView, Item, 'uses the right child view');
    t.end();
});

test('linkDialog/views/Collection: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click a'], 'triggerAttach');
    t.end();
});

test('linkDialog/views/Collection: triggerAttach', t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request').returns('/note/1');
    sand.stub(view, '$').returns({attr: () => '1'});
    sand.stub(view, 'trigger');

    t.equal(view.triggerAttach({currentTarget: 'test'}), false, 'returns false');
    t.equal(req.calledWith('utils/Url', 'getNoteLink', {id: '1'}), true,
        'makes getNoteLink request');
    t.equal(view.trigger.calledWith('attach:link', {url: '#/note/1'}), true,
        'triggers attach:link event');

    sand.restore();
    t.end();
});
