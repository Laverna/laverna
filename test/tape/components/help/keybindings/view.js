/**
 * Test components/help/keybindings/View
 * @file
 */
import test from 'tape';

/* eslint-disable */
import View from '../../../../../app/scripts/components/help/keybindings/View';
/* eslint-enable */

test('help/keybindings/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});
