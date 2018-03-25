/**
 * Test the core app: views/Layout.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
// import $ from 'jquery';
import _ from 'underscore';

import Layout from '../../../app/scripts/views/Layout';
import Loader from '../../../app/scripts/views/Loader';
global.overrideTemplate(Layout, 'templates/layout.html');

let sand;
test('Layout: before()', t => {
    sand = sinon.sandbox.create();
    sinon.stub(Layout.prototype, 'template').returns(_.template(''));
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
        toggleContent: view.toggleContent,
        showLoader   : view.showLoader,
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
    const show  = sand.stub(view, 'showChildView');

    const empty = sand.stub();
    sand.stub(view, 'getRegion').withArgs('content').returns({empty});

    view.empty({region: 'content'});
    t.equal(empty.called, true, 'empties a region');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: add()', t => {
    const view  = new Layout();
    const stub = sand.stub(view, 'getRegion');

    stub.withArgs('content').returns({});
    t.equal(view.add({region: 'content'}), false,
        'returns false if a region already exists');

    sand.spy(view, 'addRegion');
    sand.stub(view, 'createRegionElement');
    view.add({region: 'test-it'});

    t.equal(view.createRegionElement.notCalled, true,
        'does not create a new div block if "html" option is false');
    t.equal(view.addRegion.calledWith('test-it', '#test-it'), true,
        'creates a new region');

    stub.withArgs('test-it').returns({});
    t.equal(typeof view.getRegion('test-it'), 'object',
        'the new region can be found');

    view.add({region: 'test2', html: true, regionOptions: {el: 'test'}});
    t.equal(view.createRegionElement.called, true,
        'creates a new div block if "html" option is true');
    t.equal(view.addRegion.calledWithMatch('test2', {el: 'test'}), true,
        'uses "regionOptions"');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: createRegionElement()', t => {
    const view = new Layout();
    view.$el   = {append: sand.stub()};

    view.createRegionElement({html: true, region: 'test'});
    t.equal(view.$el.append.calledWith('<div id="test"/>'), true,
        'generates a div block if "html" option is not string');

    view.createRegionElement({html: '<a/>'});
    t.equal(view.$el.append.calledWith('<a/>'), true,
        'appends string from "html" option to body');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: toggle()', t => {
    const view        = new Layout();
    const toggleClass = sand.stub();
    sand.stub(view, 'getRegion').withArgs('content').returns({$el: {toggleClass}});

    view.toggle({region: 'content'});
    t.equal(toggleClass.calledWith('hidden'), true,
        'toggles "hidden" class');

    sand.restore();
    view.channel.stopReplying();
    t.end();
});

test('Layout: toggleContent()', t => {
    const view = new Layout();
    const toggleCont = sand.stub();
    const toggleSide = sand.stub();

    sand.stub(view, 'getRegion')
    .withArgs('content').returns({$el: {toggleClass: toggleCont}})
    .withArgs('sidebar').returns({$el: {toggleClass: toggleSide}});

    view.toggleContent({visible: true});
    t.equal(toggleCont.calledWith('hidden-xs', false), true,
        'shows "content" region if visible is true');
    t.equal(toggleSide.calledWith('hidden-xs', true), true,
        'hides "sidebar" region if visible is true');

    view.toggleContent({visible: false});
    t.equal(toggleCont.calledWith('hidden-xs', true), true,
        'hides "content" region if visible is false');
    t.equal(toggleSide.calledWith('hidden-xs', false), true,
        'shows "sidebar" region if visible is false');

    sand.restore();
    t.end();
});

test('Layout: showLoader()', t => {
    const view = new Layout();
    sand.stub(view, 'show').callsFake(opt => view.loadView = opt.view);

    view.showLoader({region: 'modal'});
    t.equal(view.show.calledWithMatch({region: 'modal'}), true,
        'renders the view');
    t.equal(view.loadView instanceof Loader, true,
        'uses "Loader" view');

    sand.restore();
    t.end();
});
