/**
 * Test components/notebooks/list/views/Tag
 * @file
 */
import test from 'tape';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/notebooks/list/views/Tag';
import ItemView from '../../../../../app/scripts/components/notebooks/list/views/ItemView';
/* eslint-enable */

test('notebooks/list/views/Tag: extends from ItemView', t => {
    t.equal(View.prototype instanceof ItemView, true);
    t.end();
});
