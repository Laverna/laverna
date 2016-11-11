/**
 * Test components/notebooks/controller.js
 * @file
 */
import test from 'tape';

import controller from '../../../../app/scripts/components/notebooks/controller';

test('notebooks/Controller', t => {
    t.equal(typeof controller, 'object', 'is an object');
    t.end();
});

test('Controller: showList()', t => {
    controller.showList();
    t.end();
});

test('Controller: notebookForm()', t => {
    controller.notebookForm();
    t.end();
});

test('Controller: tagForm()', t => {
    controller.tagForm();
    t.end();
});
