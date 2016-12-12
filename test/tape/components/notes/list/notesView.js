/**
 * Test components/notes/list/views/NotesView.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import NotesView from '../../../../../app/scripts/components/notes/list/views/NotesView';
import Navigate from '../../../../../app/scripts/behaviors/Navigate';
import NoteView from '../../../../../app/scripts/components/notes/list/views/NoteView';

let sand;
test('notes/list/views/NotesView: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/list/views/NotesView: useNavigateKeybindings', t => {
    t.equal(NotesView.prototype.useNavigateKeybindings, true, 'is equal to true');
    t.end();
});

test('notes/list/views/NotesView: channel', t => {
    t.equal(NotesView.prototype.channel.channelName, 'components/notes');
    t.end();
});

test('notes/list/views/NotesView: behaviors()', t => {
    const behaviors = NotesView.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Navigate) > -1, true, 'uses navigate behavior');
    t.end();
});

test('notes/list/views/NotesView: childView()', t => {
    t.equal(NotesView.prototype.childView(), NoteView, 'uses NoteView as the child view');
    t.end();
});

test('notes/list/views/NotesView: childViewOptions', t => {
    sand.stub(NotesView.prototype, 'behaviors').returns([]);
    const view = new NotesView({filterArgs: {filter: 'tag'}});
    t.deepEqual(view.childViewOptions(), view.options, 'msg');

    view.destroy();
    sand.restore();
    t.end();
});
