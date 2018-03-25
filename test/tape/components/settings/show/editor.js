/**
 * Test components/settings/show/editor/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/editor/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/editor/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/editor/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/editor/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.indentUnit, '#indentUnit');
    t.equal(ui.indentWarning, '#indentUnit-low-warning');

    t.end();
});

test('settings/show/editor/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['change @ui.indentUnit'], 'checkIndentUnit',
        'checks if indentation\'s value is lower than 3');

    t.end();
});

test('settings/show/editor/View: checkIndentUnit()', t => {
    const view = new View();
    view.ui    = {
        indentUnit    : {val: sand.stub().returns('1')},
        indentWarning : {toggleClass : sand.stub()},
    };

    view.checkIndentUnit();
    t.equal(view.ui.indentWarning.toggleClass.calledWith('hidden', false), true,
        'shows the warning if the indentation value is lower than 3');

    view.ui.indentUnit.val.returns('3');
    view.checkIndentUnit();
    t.equal(view.ui.indentWarning.toggleClass.calledWith('hidden', true), true,
        'hides the warning if the indentation value is not lower than 3');

    t.end();
});

test('settings/show/editor/View: serializeData()', t => {
    const view = new View({collection: new Configs()});
    t.equal(typeof view.serializeData(), 'object');
    t.end();
});
