/**
 * Test: components/notes/form/views/NotebooksCollection.js
 * @file
 */
import test from 'tape';

import '../../../../../../app/scripts/utils/underscore';

/* eslint-disable */
import View from '../../../../../../app/scripts/components/notes/form/views/NotebooksCollection';
import NotebookView from '../../../../../../app/scripts/components/notes/form/views/Notebook';
/* eslint-enable */

test('notes/form/views/NotebooksCollection: childView()', t => {
    const childView = View.prototype.childView();
    t.equal(childView, NotebookView, 'uses Notebook view as the child view');

    t.end();
});
