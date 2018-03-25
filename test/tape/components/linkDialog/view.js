/**
 * Test components/linkDialog/views/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
// import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';

import View from '../../../../app/scripts/components/linkDialog/views/View';
import ModalForm from '../../../../app/scripts/behaviors/ModalForm';

let sand;
test('linkDialog/views/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('linkDialog/views/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('linkDialog/views/View: behaviors', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'is an array');
    t.equal(behaviors.indexOf(ModalForm) !== -1, true, 'uses ModalForm behavior');
    t.end();
});

test('linkDialog/views/View: uiFocus', t => {
    t.equal(View.prototype.uiFocus, 'url');
    t.end();
});

test('linkDialog/views/View: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object');
    t.equal(regions.notes, '#noteMenu');
    t.end();
});

test('linkDialog/views/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.url, '[name=url]');
    t.equal(ui.dropdown, '.dropdown');
    t.equal(ui.create, '.create');

    t.end();
});

test('linkDialog/views/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['keyup @ui.url'], 'onUrlKeyup');
    t.end();
});

test('linkDialog/views/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object');
    t.equal(triggers['click @ui.create'], 'create:note');
    t.end();
});

test('linkDialog/views/View: constructor()', t => {
    sand.stub(_, 'debounce').callsFake(method => method);
    const listen = sand.stub(View.prototype, 'listenTo');
    const view   = new View();

    t.equal(_.debounce.calledWith(View.prototype.handleUrl, 200), true,
        'debounces "handleUrl" method');
    t.equal(listen.calledWith(view, 'toggle:dropdown', view.toggleDropdown), true,
        'show or hides the dropdown menu on toggle:dropdown event');

    sand.restore();
    t.end();
});

test('linkDialog/views/View: renderDropdown()', t => {
    const view   = new View();
    const show   = sand.stub(view, 'showChildView');
    const listen = sand.stub(view, 'listenTo');

    view.renderDropdown();
    t.equal(show.calledWith('notes', view.dropView), true,
        'renders dropdown menu');
    t.equal(listen.calledWith(view.dropView, 'attach:link', view.attachLink), true,
        'listens to attach:link event');

    sand.restore();
    t.end();
});

test('linkDialog/views/View: onUrlKeyup()', t => {
    const view = new View();
    sand.stub(view, 'handleUrl');

    view.onUrlKeyup();
    t.equal(view.handleUrl.called, true, 'calls "handleUrl" method');

    sand.restore();
    t.end();
});

test('linkDialog/views/View: handleUrl()', t => {
    sand.stub(_, 'debounce').callsFake(method => method);
    const view = new View();
    view.ui    = {
        url     : {val: () => 'https://laverna.cc'},
        create  : {toggleClass: sand.stub()},
    };
    sand.stub(view, 'onAttachLink');
    sand.stub(view, 'trigger');

    view.handleUrl();
    t.equal(view.onAttachLink.called, true,
        'calls "onAttachLink" method if it is a URL');

    view.ui.url.val = () => 'Test';
    view.handleUrl();
    t.equal(view.ui.create.toggleClass.calledWith('hidden', false), true,
        'shows the create button');
    t.equal(view.trigger.calledWithMatch('search', {text: 'Test'}), true,
        'triggers "search" event');

    sand.restore();
    t.end();
});

test('linkDialog/views/View: onAttachLink()', t => {
    const view = new View();
    view.ui    = {
        create : {addClass : sand.stub()},
        url    : {focus    : sand.stub()},
    };
    sand.stub(view, 'toggleDropdown');

    view.onAttachLink();
    t.equal(view.ui.create.addClass.calledWith('hidden'), true,
        'hides the create button');
    t.equal(view.ui.url.focus.called, true, 'focuses on URL input');
    t.equal(view.toggleDropdown.called, true, 'calls "toggleDropdown" method');

    sand.restore();
    t.end();
});

test('linkDialog/views/View: attachLink()', t => {
    const view = new View();
    view.ui    = {url: {val: sand.stub()}};
    sand.stub(view, 'onAttachLink');

    view.attachLink({url: '#/test'});
    t.equal(view.ui.url.val.calledWith('#/test'), true, 'changes URL input\'s value');
    t.equal(view.onAttachLink.called, true, 'calls "onAttachLink" method');

    sand.restore();
    t.end();
});

test('linkDialog/views/View: toggleDropdown()', t => {
    const view = new View();
    view.ui    = {dropdown: {toggleClass: sand.stub()}};

    view.toggleDropdown();
    t.equal(view.ui.dropdown.toggleClass.calledWith('open', false), true,
        'hides the menu by default');

    view.toggleDropdown({length: 1});
    t.equal(view.ui.dropdown.toggleClass.calledWith('open', 1), true,
        'shows the menu');

    sand.restore();
    t.end();
});
