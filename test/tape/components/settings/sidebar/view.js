/**
 * Test components/settings/sidebar/View.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import View from '../../../../../app/scripts/components/settings/sidebar/views/View';
import Sidebar from '../../../../../app/scripts/behaviors/Sidebar';
/* eslint-enable */

let sand;
test('settings/sidebar/views/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/sidebar/views/View: behaviors', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'is an array');
    t.equal(behaviors.indexOf(Sidebar) !== -1, true, 'uses sidebar behavior');
    t.end();
});

test('settings/sidebar/views/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['click a'], 'confirm',
        'do not leave the page without confirmation');
    t.end();
});

test('settings/sidebar/views/View: onRender()', t => {
    const view = new View({tab: 'test'});
    sand.stub(view, 'activateTab');

    view.onRender();
    t.equal(view.activateTab.calledWith({tab: 'test'}), true,
        'activates a tab');

    sand.restore();
    t.end();
});

test('settings/sidebar/views/View: activateTab()', t => {
    const view = new View();
    const jq = sand.stub(view, '$');

    const removeClass = sand.stub();
    jq.withArgs('.active').returns({removeClass});
    const addClass = sand.stub();
    jq.withArgs('[href*=test]').returns({addClass});

    view.activateTab({tab: 'test'});
    t.equal(removeClass.calledWith('active'), true,
        'removes "active" class from the previously active tab');
    t.equal(addClass.calledWith('active'), true,
        'makes a new tab active');

    sand.restore();
    t.end();
});

test('settings/sidebar/views/View: confirm()', t => {
    const view = new View();
    const evt  = {preventDefault: sand.stub(), currentTarget: '#test'};
    sand.stub(view, '$').withArgs('#test')
        .returns({attr: () => '/url'});
    const request = sand.stub(Radio, 'request');

    view.confirm(evt);
    t.equal(evt.preventDefault.called, true, 'prevents the default behavior');

    t.equal(request.calledWith('components/settings', 'confirmNavigate', {url: '/url'}),
        true, 'makes "confirmNavigate" request on components/settings channel');

    sand.restore();
    t.end();
});

test('settings/sidebar/views/View: serializeData()', t => {
    const opt  = {tab: 'test'};
    const view = new View(opt);
    t.deepEqual(view.serializeData(), opt, 'returns options');
    t.end();
});
