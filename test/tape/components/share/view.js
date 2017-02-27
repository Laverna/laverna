/**
 * Test components/share/View.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Mousetrap from 'mousetrap';

import _ from '../../../../app/scripts/utils/underscore';
import View from '../../../../app/scripts/components/share/View';

let sand;
test('share/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('share/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('share/View: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object', 'returns an object');
    t.equal(regions.content, '#share--content');

    t.end();
});

test('share/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.end();
});

test('share/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['click @ui.back'], 'showUsers');

    t.end();
});

test('share/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object', 'returns an object');
    t.equal(triggers['submit .share--search'], 'search:user');

    t.end();
});

test('share/View: onRender()', t => {
    const view = new View();
    sand.stub(view, 'showUsers');

    view.onRender();
    t.equal(view.showUsers.called, true, 'shows a list of users');

    sand.restore();
    t.end();
});

test('share/View: onShownModal()', t => {
    const view = new View();
    view.ui    = {search: {focus: sand.stub()}};

    view.onShownModal();
    t.equal(view.ui.search.focus.called, true, 'focuses on "search" input');

    sand.restore();
    t.end();
});

test('share/View: showUsers()', t => {
    const view = new View();
    view.ui    = {back: {addClass: sand.stub()}};
    sand.stub(view, 'showChildView');

    view.showUsers();
    t.equal(view.showChildView.calledWith('content'), true,
        'shows a list of users');
    t.equal(view.ui.back.addClass.calledWith('hidden'), true,
        'hides the "back" button');

    sand.restore();
    t.end();
});

test('share/View: onSearch()', t => {
    const view = new View();
    view.ui    = {
        search    : {val: sand.stub()},
        formField : {attr: sand.stub()},
    };

    view.onSearch({disabled: true});
    t.equal(view.ui.search.val.calledWith(''), true, 'empties the search input');
    t.equal(view.ui.formField.attr.calledWith('disabled', true), true,
        'disables search form field');

    view.onSearch({disabled: false});
    t.equal(view.ui.formField.attr.calledWith('disabled', false), true,
        'enables search form field');

    sand.restore();
    t.end();
});

test('share/View: onUserError()', t => {
    const view = new View();
    view.ui    = {userError: {removeClass: sand.stub()}};

    view.onUserError();
    t.equal(view.ui.userError.removeClass.calledWith('hidden'), true,
        'shows the error message');

    sand.restore();
    t.end();
});

test('share/View: showUserInfo()', t => {
    const view = new View();
    view.ui    = {
        back      : {removeClass: sand.stub()},
        userError : {addClass: sand.stub()},
    };
    sand.stub(view, 'showChildView');

    view.showUserInfo({});
    t.equal(view.showChildView.called, true, 'shows the user information');
    t.equal(view.ui.back.removeClass.calledWith('hidden'), true,
        'shows the "back" button');
    t.equal(view.ui.userError.addClass.calledWith('hidden'), true,
        'hides error messages');

    sand.restore();
    t.end();
});
