/**
 * Test components/notes/controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import _ from 'underscore';
import Radio from 'backbone.radio';

// Fix mousetrap bug
const Mousetrap     = require('mousetrap');
global.Mousetrap    = Mousetrap;

/* eslint-disable */
const controller = require('../../../../app/scripts/components/notes/controller').default;
const List       = require('../../../../app/scripts/components/notes/list/Controller').default;
const Show       = require('../../../../app/scripts/components/notes/show/Controller').default;
const Form       = require('../../../../app/scripts/components/notes/form/Controller').default;
/* eslint-enable */

let sand;
test('notes/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/Controller: get options', t => {
    t.equal(typeof controller.options, 'object', 'is an object');
    t.equal(_.isEmpty(controller.options), true,
        'returns an empty object for default');
    t.end();
});

test('notes/Controller: set options', t => {
    t.equal(controller._argsOld, undefined, 'filter backup is empty for default');

    controller._args   = {test: 'id'};
    controller.options = ['tag', 'my-tag', '2', 'my-note-id'];

    t.deepEqual(controller._argsOld, {test: 'id'}, 'updates the filter backup');
    t.deepEqual(controller.options, controller._args,
        'uses _args property');
    t.deepEqual(controller._args, {
        filter    : 'tag',
        query     : 'my-tag',
        page      : '2',
        id        : 'my-note-id',
    }, 'creates a correct filter object');

    t.end();
});

test('notes/Controller: showNotes()', t => {
    const init    = sand.stub(List.prototype, 'init');
    const oldArgs = _.clone(controller._args);
    const changed = sand.stub(controller, 'filterHasChanged');
    const once    = sand.stub(List.prototype, 'once');

    changed.returns(false);
    controller.showNotes();
    t.equal(init.notCalled, true,
        'does not render notes sidebar if filter parameters are the same');

    changed.returns(true);
    controller.showNotes('showNotes');
    t.notDeepEqual(controller.options, oldArgs, 'changes filter options');
    t.equal(init.called, true, 'initializes list controller');
    t.equal(once.calledWith('destroy'), true,
        'listens to controllers destroy event');

    sand.restore();
    t.end();
});

test('notes/Controller: onListDestroy()', t => {
    const req = sand.stub(Radio, 'request').returns('notes');

    controller.options = ['test-profile'];
    controller.onListDestroy();
    t.equal(req.calledWith('utils/Url', 'getHash'), true,
        'makes getHash request');

    req.returns('notebooks');
    controller.onListDestroy();

    sand.restore();
    t.end();
});

test('notes/Controller: filterHasChanged()', t => {
    controller._args    = {};
    controller._argsOld = {};
    t.equal(controller.filterHasChanged(), false,
        'returns false if filters did not change');

    controller._args.id = 'my-note';
    t.equal(controller.filterHasChanged(), false,
        'returns false if only ID changed');

    controller._args.page = 2;
    t.equal(controller.filterHasChanged(), false,
        'returns false if only page changed');

    controller._argsOld = undefined;
    t.equal(controller.filterHasChanged(), false,
        'returns false if _argsOld property does not exist');

    controller._args.filter = 'notebook';
    t.equal(controller.filterHasChanged(), true,
        'returns true if filter parameters changed');


    t.end();
});

test('notes/Controller: showNote()', t => {
    const init      = sand.stub(Show.prototype, 'init');
    const showNotes = sand.stub(controller, 'showNotes');

    controller.showNote();
    t.equal(showNotes.called, true, 'shows the sidebar');
    t.equal(init.called, true, 'msg');

    sand.restore();
    t.end();
});

test('notes/Controller: showForm()', t => {
    const init      = sand.stub(Form.prototype, 'init');
    const showNotes = sand.stub(controller, 'showNotes');

    controller.showForm('id-1');
    t.equal(_.isEmpty(controller.options), false, 'options object is not empty');
    t.equal(showNotes.notCalled, true,
        'does not show the sidebar if it is already shown');
    t.equal(init.called, true, 'shows the form');

    controller._args = {};
    controller.showForm('id-1');
    t.equal(_.isEmpty(controller.options), true, 'options object is empty');
    t.equal(showNotes.called, true,
        'does not show the sidebar if it is already shown');
    t.equal(init.called, true, 'shows the form');

    sand.restore();
    t.end();
});
