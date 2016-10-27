/**
 * Test behaviors/ModelFocus.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import ModelFocus from '../../../app/scripts/behaviors/ModelFocus';

let sand;
test('behaviors/ModelFocus: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('behaviors/ModelFocus: ui()', t => {
    const ui = ModelFocus.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.listGroup, '.list-group-item:first');

    t.end();
});

test('behaviors/ModelFocus: modelEvents()', t => {
    const events = ModelFocus.prototype.modelEvents();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events.focus, 'onFocus');

    t.end();
});

test('behaviors/ModelFocus: onFocus()', t => {
    const focus        = new ModelFocus();
    focus.view         = {trigger: sand.stub()};
    focus.oldUi        = focus.ui;
    focus.ui.listGroup = {
        addClass : sand.stub(),
        offset   : sand.stub().returns(1),
    };

    focus.onFocus();
    t.equal(focus.ui.listGroup.addClass.calledWith('active'), true,
        'adds "active" class to listGroup element');
    t.equal(focus.view.trigger.calledWith('scroll:top', {offset: 1}), true,
        'triggers "scroll:top" event');

    focus.view = null;
    focus.ui   = focus.oldUi;
    sand.restore();
    t.end();
});
