/**
 * Test components/notebooks/form/tag/View
 * @file
 */
import test from 'tape';

/* eslint-disable */
import _ from '../../../../../../app/scripts/utils/underscore';
import View from '../../../../../../app/scripts/components/notebooks/form/tag/View';
import ModalForm from '../../../../../../app/scripts/behaviors/ModalForm';
/* eslint-enable */

test('notebooks/form/tag/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('notebooks/form/tag/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.name, 'input[name="name"]');
    t.end();
});

test('notebooks/form/tag/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(ModalForm) !== -1, true, 'uses ModalForm behavior');

    t.end();
});
