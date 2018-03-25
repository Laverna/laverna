/**
 * Test components/help/about/View
 * @file
 */
import test from 'tape';
import View from '../../../../../app/scripts/components/help/about/View';

test('View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('View: serializeData()', t => {
    const view = new View({constants: 'test'});
    t.deepEqual(view.serializeData(), {constants: 'test'});
    t.end();
});
