/**
 * Test components/setup/export/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../app/scripts/utils/underscore';
import View from '../../../../app/scripts/components/setup/export/View';

let sand;
test('setup/export/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/export/View: serializeData()', t => {
    const opt  = {el: 'test'};
    const view = new View(opt);

    t.deepEqual(view.serializeData(), opt);

    t.end();
});
