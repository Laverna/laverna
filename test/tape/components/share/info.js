/**
 * Test components/share/info/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Mousetrap from 'mousetrap';

import _ from '../../../../app/scripts/utils/underscore';
import View from '../../../../app/scripts/components/share/info/View';

let sand;
test('share/info/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('share/info/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object');
    t.equal(triggers['click .share--trust'], 'add:trust',
        'triggers "add:trust" event');

    t.end();
});

test('share/info/Users: serializeData()', t => {
    const view = new View({test: '1'});
    t.equal(view.serializeData(), view.options);
    t.end();
});
