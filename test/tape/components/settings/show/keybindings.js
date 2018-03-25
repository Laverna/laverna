/**
 * Test components/settings/show/keybindings/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/keybindings/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/keybindings/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/keybindings/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/keybindings/View: serializeData()', t => {
    const view = new View({id: 'test'});
    t.equal(view.serializeData(), view.options, 'returns options');
    t.end();
});

test('settings/show/keybindings/View: templateContext()', t => {
    const context      = new View().templateContext();
    context.collection = new Configs();
    const filterByName = sand.stub(context.collection, 'filterByName').returns([1, 2]);

    context.filter('test');
    t.equal(filterByName.calledWith('test'), true, 'calls filterByName method');

    const appShortcuts = sand.stub(context.collection, 'appShortcuts');
    context.appShortcuts();
    t.equal(appShortcuts.called, true, 'calls appShortcuts method');

    sand.restore();
    t.end();
});
