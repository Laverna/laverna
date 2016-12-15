/**
 * Test components/settings/show/sync/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/sync/View';
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
    const view = new View({collection: new Configs()});
    t.deepEqual(view.serializeData(), {
        models         : {},
        dropboxKeyNeed : false,
    });
    t.end();
});
