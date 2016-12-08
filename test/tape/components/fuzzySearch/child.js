/**
 * Test components/fuzzySearch/views/Child
 * @file
 */
import test from 'tape';
import '../../../../app/scripts/utils/underscore';

import Child from '../../../../app/scripts/components/fuzzySearch/views/Child';

test('fuzzySearch/views/Child: className', t => {
    t.equal(Child.prototype.className, 'list-group list--group');
    t.end();
});

test('fuzzySearch/views/Child: triggers()', t => {
    const view = new Child();
    const trig = view.triggers();

    t.equal(typeof trig, 'object', 'returns an object');
    t.equal(trig['click .list-group-item'], 'navigate:search',
        'triggers navigate:search event');

    t.end();
});
