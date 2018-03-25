/**
 * Test: components/notes/form/views/Notebooks.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import '../../../../../../app/scripts/utils/underscore';
import Notebooks from '../../../../../../app/scripts/collections/Notebooks';
import View from '../../../../../../app/scripts/components/notes/form/views/Notebooks';

let sand;
test('notes/form/views/Notebooks: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/form/views/Notebooks: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object', 'returns an object');
    t.deepEqual(regions.list, {el: '.editor--notebooks--select', replaceElement: true});

    t.end();
});

test('notes/form/views/Notebooks: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.notebookId, '[name="notebookId"]');

    t.end();
});

test('notes/form/views/Notebooks: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['change @ui.notebookId'], 'addNotebook');

    t.end();
});

test('notes/form/views/Notebooks: onRender()', t => {
    const view = new View({notebookId: '1'});
    sand.stub(view, 'showChildView');
    sand.stub(view, 'selectModel');

    view.onRender();
    t.equal(view.showChildView.calledWith('list'), true,
        'shows the list of notebooks');
    t.equal(view.selectModel.calledWith({id: '1'}), true,
        'makes a notebook active');

    sand.restore();
    t.end();
});

test('notes/form/views/Notebooks: selectModel()', t => {
    const view = new View();
    view.ui    = {notebookId: {val: sand.stub()}};

    view.selectModel({id: '2'});
    t.equal(view.ui.notebookId.val.calledWith('2'), true,
        'changes the value of the notebook selector');

    sand.restore();
    t.end();
});

test('notes/form/views/Notebooks: addNotebook()', t => {
    const collection = new Notebooks();
    const view = new View({notebookId: '1', collection});
    const is   = sand.stub();
    view.ui    = {notebookId: {
        find : sand.stub().returns({is}),
        val  : sand.stub().returns('2'),
    }};
    const req = sand.stub(Radio, 'request').returns(Promise.resolve({model: {id: '2'}}));
    sand.stub(view, 'selectModel');

    is.returns(false);
    view.addNotebook();
    t.equal(req.notCalled, true,
        'does nothing if the addNotebook option is not selected');

    is.returns(true);
    const res = view.addNotebook();
    t.equal(view.ui.notebookId.val.calledWith('1'), true,
        'makes the previously selected notebook active again');
    t.equal(req.calledWith('components/notebooks', 'notebookForm'), true,
        'tries to add a new notebook');

    res.then(() => {
        t.deepEqual(view.selectModel.calledWith({id: '2'}), true,
            'selects the newly added notebook');

        sand.restore();
        t.end();
    });
});
