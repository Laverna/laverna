/**
 * Test components/settings/show/Behavior
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
/* eslint-enable */

let sand;
test('settings/show/Behavior: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/Behavior: events()', t => {
    const events = Behavior.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['input input, select, textarea'], 'triggerChange',
        'triggers change:value event on input');
    t.equal(events['change input, select, textarea'], 'triggerChange',
        'triggers change:value event on change');

    t.equal(events['change .show-onselect'], 'showOnSelect');
    t.equal(events['click .showField'], 'showOnCheck');

    t.end();
});

test('settings/show/Behavior: triggerChange()', t => {
    const behavior = Behavior.prototype;
    const attr     = sand.stub();
    const jq       = {
        attr : sand.stub(),
        val  : sand.stub().returns('codemirror'),
        is   : sand.stub().returns(true),
    };
    behavior.view  = {
        $: sand.stub().withArgs('#test').returns(jq),
        trigger: sand.stub(),
    };
    jq.attr.withArgs('name').returns('editor');
    jq.attr.withArgs('type').returns('input');

    // Test input[type=text]
    behavior.triggerChange({currentTarget: '#test'});
    t.equal(behavior.view.trigger.calledWith('change:value', {
        name  : 'editor',
        value : 'codemirror',
    }), true, 'triggers change:value event');

    // Test input[type=checkbox]
    jq.attr.withArgs('type').returns('checkbox');
    behavior.triggerChange({currentTarget: '#test'});
    t.equal(behavior.view.trigger.calledWith('change:value', {
        name  : 'editor',
        value : 1,
    }), true, 'triggers change:value with "1" if it is a checkbox');

    behavior.view = null;
    sand.restore();
    t.end();
});
