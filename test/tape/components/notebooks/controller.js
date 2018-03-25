/**
 * Test components/notebooks/controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import controller from '../../../../app/scripts/components/notebooks/controller';
import List from '../../../../app/scripts/components/notebooks/list/Controller';
import NotebookForm from '../../../../app/scripts/components/notebooks/form/notebook/Controller';
import TagForm from '../../../../app/scripts/components/notebooks/form/tag/Controller';
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
    t.equal(init.called, true);

    sand.restore();
    t.end();
});

test('Controller: notebookForm()', t => {
    const init = sand.stub(NotebookForm.prototype, 'init');
    controller.notebookForm();
    t.equal(init.called, true);

    sand.restore();
    t.end();
});

test('Controller: notebookFormReply()', t => {
    sand.stub(controller, 'notebookForm');

    const res = controller.notebookFormReply({profileId: 'test', id: '1'});
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(controller.notebookForm.calledWith('1'), true,
        'calls notebookForm method');

    sand.restore();
    t.end();
});

test('Controller: tagForm()', t => {
    const init = sand.stub(TagForm.prototype, 'init');
    controller.tagForm();
    t.equal(init.called, true);

    sand.restore();
    t.end();
});
