/**
 * Test components/notes/list/views/NoteView.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../../app/scripts/utils/underscore';

import NoteView from '../../../../../app/scripts/components/notes/list/views/NoteView';
import ModelFocus from '../../../../../app/scripts/behaviors/ModelFocus';
import Note from '../../../../../app/scripts/models/Note';

let sand;
test('notes/list/views/NoteView: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/list/views/NoteView: behaviors()', t => {
    const behaviors = NoteView.prototype.behaviors();
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(ModelFocus) > -1, true, 'uses ModelFocus behavior');
    t.end();
});

test('notes/list/views/NoteView: ui()', t => {
    const ui = NoteView.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.favorite, '.favorite');

    t.end();
});

test('notes/list/views/NoteView: events()', t => {
    const events = NoteView.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['click @ui.favorite'], 'toggleFavorite',
        'toggles favorite status of a note if favorite button is clicked');

    t.end();
});

test('notes/list/views/NoteView: modelEvents()', t => {
    const events = NoteView.prototype.modelEvents();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events.change, 'render', 're-renders the view on change');
    t.equal(events['change:trash'], 'remove',
        'removes the view if trash status is changed');

    t.end();
});

test('notes/list/views/NoteView: toggleFavorite()', t => {
    const model = new Note();
    const view  = new NoteView({model});

    const toggle  = sand.stub(model, 'toggleFavorite');
    const request = sand.stub(Radio, 'request');

    view.toggleFavorite();
    t.equal(toggle.called, true, 'toggle favorite status');
    t.equal(request.calledWith('collections/Notes', 'saveModel', {model}), true,
        'saves the model');

    view.destroy();
    sand.restore();
    t.end();
});

test('notes/list/views/NoteView: serializeData()', t => {
    const model = new Note();
    const view  = new NoteView({model, filterArgs: {filter: 'yes'}});
    sand.spy(_, 'extend');

    t.equal(typeof view.serializeData(), 'object', 'returns an object');
    t.equal(_.extend.calledWithMatch({}, model.attributes, {
        filterArgs: view.options.filterArgs,
    }), true, 'contains model attributes and filter parameters');

    view.destroy();
    t.end();
});

test('notes/list/views/NoteView: templateContext()', t => {
    const context   = NoteView.prototype.templateContext();

    t.equal(typeof context, 'object', 'returns an object');

    context.content = 'a'.repeat(1000);
    sand.spy(_, 'unescape');
    t.equal(context.getContent().length, 50, 'shortens content');
    t.equal(_.unescape.calledWith(context.content), true, 'unescapes special characters');

    const request = sand.stub(Radio, 'request').returns('reply');
    t.equal(context.link(), 'reply', 'returns the result of the request');
    t.equal(request.calledWith('utils/Url', 'getNoteLink', context), true,
        'requests note link');

    context.filterArgs = {id: '1'};
    context.id         = '1';
    t.equal(context.isActive(), 'active',
        'returns "active" if ID in filterArgs is the same the model\'s');
    context.id = '2';
    t.equal(context.isActive(), '', 'returns empty string');

    sand.restore();
    t.end();
});
