/**
 * Test components/navbar/View.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import _ from 'underscore';
import Radio from 'backbone.radio';

import View from '../../../../app/scripts/components/navbar/View';
import Sidemenu from '../../../../app/scripts/behaviors/Sidemenu';
import Notebooks from '../../../../app/scripts/collections/Notebooks';

let sand;
test('navbar/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('navbar/View: channel', t => {
    const channel = View.prototype.channel;
    t.equal(typeof channel, 'object', 'returns an object');
    t.equal(channel.channelName, 'components/navbar');
    t.end();
});

test('navbar/View: behaviors', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'is an array');
    t.equal(behaviors[0], Sidemenu, 'uses Sidemenu behavior');
    t.end();
});

test('navbar/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.end();
});

test('navbar/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');

    t.equal(events['click #header--add--tag'], 'navigateAddTag',
        'opens a new tag form if the "add" button is clicked');
    t.equal(events['click #header--add--notebook'], 'navigateAddNotebook',
        'opens a new notebook form if the "add" button is clicked');
    t.equal(events['click #header--about'], 'showAbout',
        'shows "about" page');
    t.equal(events['click #header--sync'], 'triggerSync',
        'starts synchronization if the sync button is clicked');
    t.equal(events['click #header--sbtn'], 'showSearch',
        'shows the search form if the button is clicked');
    t.equal(events['blur @ui.search'], 'hideSearch',
        'hides the search form if the input lost focus');
    t.equal(events['keyup @ui.search'], 'onSearchKeyup',
        'listens to keyup event');
    t.equal(events['submit #header--search'], 'onSearchSubmit',
        'listens to submit event on search form');

    t.end();
});

test('navbar/View: initialize()', t => {
    const stub    = sand.stub(View.prototype, 'listenTo');
    const notebooks = new Notebooks();
    const view      = new View({notebooks});

    const channel = Radio.channel;
    t.equal(
        stub.calledWith(channel('utils/Keybindings'), 'appSearch', view.showSearch),
        true,
        'listens to appSearch keybinding event'
    );

    t.equal(
        stub.calledWith(channel('components/sync'), 'start', view.onSyncStart),
        true,
        'listens to the event fired after synchronization has started'
    );
    t.equal(
        stub.calledWith(channel('components/sync'), 'stop', view.onSyncStop),
        true,
        'listens to the event fired after synchronization has stopped'
    );

    t.equal(stub.calledWith(notebooks, 'change add remove', view.render), true,
        're-renders the view if notebook collection is changed');

    sand.restore();
    t.end();
});

test('navbar/View: onDestroy()', t => {
    const view = new View({notebooks: new Notebooks()});
    sand.stub(view.channel, 'trigger');

    view.destroy();
    t.equal(view.channel.trigger.calledWith('hidden:search'), true,
        'triggers "hidden:search" event');

    sand.restore();
    t.end();
});

test('navbar/View: navigateAddNotebook()', t => {
    const view = new View({notebooks: new Notebooks()});
    sand.stub(view.channel, 'trigger');

    view.navigateAdd();
    t.equal(view.channel.trigger.calledWith('show:form'), true,
        'triggers "show:form" event');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: showAbout()', t => {
    const view = new View({notebooks: new Notebooks()});
    const req  = sand.stub(Radio, 'request');

    view.showAbout();
    t.equal(req.calledWith('components/help', 'showAbout'), true,
        'shows "about" page');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: triggerSync()', t => {
    const view = new View({notebooks: new Notebooks()});
    const req = sand.stub(Radio, 'request');

    view.triggerSync();
    t.equal(req.calledWith('components/sync', 'start'), true,
        'starts synchronization process');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: showSearch()', t => {
    const view   = new View({notebooks: new Notebooks()});
    const select = sand.stub();
    view.ui      = {
        navbar : {addClass : sand.stub()},
        search : {focus    : sand.stub().returns({select})},
    };
    sand.stub(view.channel, 'trigger');

    view.showSearch();
    t.equal(view.ui.navbar.addClass.calledWith('-search'), true,
        'makes the search bar visible');
    t.equal(view.ui.search.focus.called, true, 'brings focus to the search bar');
    t.equal(select.called, true, 'selects the search bar');
    t.equal(view.channel.trigger.calledWith('shown:search'), true,
        'triggers shown:search event');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: hideSearch()', t => {
    const view = new View({notebooks: new Notebooks()});
    view.ui    = {navbar: {removeClass: sand.stub()}};

    view.hideSearch();
    t.equal(view.ui.navbar.removeClass.calledWith('-search'), true,
        'hides the search bar');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: onSearchKeyup()', t => {
    const view = new View({notebooks: new Notebooks()});
    const trim = sand.stub().returns('test');
    view.ui    = {search: {val: sand.stub().returns({trim})}};
    sand.stub(view, 'hideSearch');
    sand.stub(view.channel, 'trigger');

    view.onSearchKeyup({which: 27});
    t.equal(view.channel.trigger.calledWith('hidden:search'), true,
        'triggers hidden:search event');
    t.equal(view.hideSearch.called, true,
        'hides the search form if escape key is pressed');
    t.equal(view.channel.trigger.calledWith('change:search'), false,
        'does not trigger change:search event');

    view.onSearchKeyup({which: 2});
    t.equal(view.channel.trigger.calledWith('change:search', {query: 'test'}), true,
        'triggers change:search event');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: onSearchSubmit()', t => {
    const view = new View({notebooks: new Notebooks()});
    const trim = sand.stub().returns('');
    view.ui    = {search: {val: sand.stub().returns({trim})}};
    const trig = sand.stub(view.channel, 'trigger');
    sand.stub(view, 'hideSearch');
    sand.stub(view, 'trigger');

    view.onSearchSubmit();
    t.equal(view.hideSearch.called, true, 'hides the search bar');
    t.equal(view.trigger.calledWith('submit:search'), false,
        'does not trigger submit:search event if query text is empty');
    t.equal(trig.calledWith('hidden:search'), true,
        'triggers hidden:search event on the channel');

    trim.returns('Test');
    view.onSearchSubmit();
    t.equal(view.trigger.calledWith('submit:search', {query: 'Test'}), true,
        'triggers submit:search event');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: onSyncStart() + onSyncStop()', t => {
    const view = new View({notebooks: new Notebooks()});
    view.ui    = {sync: {toggleClass: sand.stub()}};

    view.onSyncStart();
    t.equal(view.ui.sync.toggleClass.calledWith('animate-spin', true), true,
        'starts spinning the synchronization icon');

    view.onSyncStop();
    t.equal(view.ui.sync.toggleClass.calledWith('animate-spin', false), true,
        'stops spinning the synchronization icon');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: onChangeTitle()', t => {
    const args = {titleOptions: {section: 'Notebooks'}};
    const view = new View({args, notebooks: new Notebooks()});
    view.ui    = {title: {text: sand.stub()}};

    view.onChangeTitle({titleOptions: {section: 'All notes'}});
    t.equal(view.ui.title.text.calledWith('All notes'), true,
        'changes the navbar title');
    t.equal(view.options.args.titleOptions.section, 'All notes',
        'changes view options');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: serializeData()', t => {
    const view = new View({
        args         : {titleOptions: {section: 'Test title'}},
        notebooks    : new Notebooks(),
        configs      : {navbarNotebooksMax : 10},
    });
    const req  = sand.stub(Radio, 'request').returns('testurl');
    sand.spy(_, 'first');

    const res = view.serializeData();
    t.equal(_.first.calledWith(view.options.notebooks.toJSON(), 10), true,
        'shows only the first 10 notebooks');

    t.equal(typeof res, 'object', 'returns an object');
    t.equal(res.title, 'Test title');

    view.destroy();
    sand.restore();
    t.end();
});

test('navbar/View: templateContext()', t => {
    const context   = View.prototype.templateContext();
    context.configs = {cloudStorage: 'dropbox'};

    t.equal(context.isSyncEnabled(), true,
        'isSyncEnabled returns true if dropbox is enabled');

    context.configs.cloudStorage = '';
    t.equal(context.isSyncEnabled(), false,
        'isSyncEnabled returns false if dropbox is disabled');

    sand.restore();
    t.end();
});
