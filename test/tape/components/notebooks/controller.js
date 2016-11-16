/**
 * Test components/notebooks/controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import controller from '../../../../app/scripts/components/notebooks/controller';
import List from '../../../../app/scripts/components/notebooks/list/Controller';
/* eslint-enable */

let sand;
test('notebooks/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notebooks/Controller', t => {
    t.equal(typeof controller, 'object', 'is an object');
    t.end();
});

test('Controller: showList()', t => {
    const init = sand.stub(List.prototype, 'init');
    controller.showList();
    t.equal(init.called, true, 'msg');

    sand.restore();
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
