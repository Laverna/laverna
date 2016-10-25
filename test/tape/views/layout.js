/**
 * Test the core app: views/Layout.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import $ from 'jquery';

import Layout from '../../../app/scripts/views/Layout';
global.overrideTemplate(Layout, 'templates/layout.html');

let sand;
test('Layout: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Layout: channel', t => {
    const channel = Layout.prototype.channel;
    t.equal(typeof channel, 'object', 'is an object');
    t.equal(channel.channelName, 'Layout', 'is equal to Layout');
    t.end();
});

test('Layout: el()', t => {
    t.equal(Layout.prototype.el(), '#wrapper', 'has "el" property');
    t.end();
});

test('Layout: regions()', t => {
    const regions = Layout.prototype.regions();
    t.equal(typeof regions, 'object', 'is an object');
    t.end();
});

test('Layout: initialize()', t => {
    const reply = sand.stub(Layout.prototype.channel, 'reply');
    const view  = new Layout();

    t.equal(reply.calledWith({
        show   : view.show,
        empty  : view.empty,
        add    : view.add,
        toggle : view.toggle,
    }), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('Layout: show()', t => {
    const view  = new Layout();
    const show  = sand.stub(view, 'showChildView');

    view.show({region: 'content', view: {render: ''}});
    t.equal(show.calledWith('content', {render: ''}), true,
        'renders the view in a specified region');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: empty()', t => {
    const view  = new Layout();

    const empty = sand.stub(view.getRegion('content'), 'empty');
    view.empty({region: 'content'});
    t.equal(empty.called, true, 'empties a region');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: add()', t => {
    const view  = new Layout();

    t.equal(view.add({region: 'content'}), false,
        'returns false if a region already exists');

    sand.spy(view.$body, 'append');
    sand.spy(view, 'addRegion');
    view.add({region: 'test-it'});

    t.equal(view.$body.append.calledWith('<div id="test-it"/>'), true,
        'creates a new div block');
    t.equal($('#test-it').length, 1, 'the new element can be found');

    t.equal(view.addRegion.calledWith('test-it', '#test-it'), true,
        'creates a new region');
    t.equal(typeof view.getRegion('test-it'), 'object',
        'the new region can be found');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: toggle()', t => {
    const view   = new Layout();
    const toggle = sand.spy(view.getRegion('content').$el, 'toggleClass');

    view.toggle({region: 'content'});
    t.equal(toggle.calledWith('hidden'), true,
        'toggles "hidden" class');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});
