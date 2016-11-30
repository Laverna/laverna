/**
 * Test: components/notes/form/views/Form.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../../../app/scripts/utils/underscore';
import Note from '../../../../../../app/scripts/models/Note';

// Fix mousetrap bug
const Mousetrap     = require('mousetrap');
global.Mousetrap    = Mousetrap;

/* eslint-disable */
const View      = require('../../../../../../app/scripts/components/notes/form/views/Form').default;
const Notebooks = require('../../../../../../app/scripts/components/notes/form/views/Notebooks').default;
/* eslint-enable */

let sand;
test('notes/form/views/Form: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notes/form/views/Form: className', t => {
    t.equal(View.prototype.className, 'layout--body');
    t.end();
});

test('notes/form/views/Form: channel', t => {
    const channel = View.prototype.channel;
    t.equal(typeof channel, 'object', 'returns an object');
    t.equal(channel.channelName, 'components/notes/form', 'msg');
    t.end();
});

test('notes/form/views/Form: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object', 'returns an object');
    t.equal(regions.editor, '#editor');
    t.equal(regions.notebooks, '#editor--notebooks');

    t.end();
});

test('notes/form/views/Form: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.form, '.editor--form');
    t.equal(ui.saveBtn, '.editor--save');
    t.equal(ui.title, '#editor--input--title');

    t.end();
});

test('notes/form/views/Form: events', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');

    t.equal(events['click .editor--mode a'], 'switchMode',
        'switches the edit mode if the switch button is clicked');
    t.equal(events['submit @ui.form'], 'save', 'saves the changes on form submit');
    t.equal(events['click @ui.saveBtn'], 'save',
        'saves the changes if the save button is clicked');
    t.equal(events['click .editor--cancel'], 'cancel',
        'cancels all changes if the cancel button is clicked');

    t.end();
});

test('notes/form/views/Form: initialize()', t => {
    const reply = sand.stub(View.prototype.channel, 'reply');
    const bind  = sand.stub(View.prototype, 'bindKeys');
    const view  = new View({model: new Note()});

    t.equal(reply.calledWith({
        getModel      : view.model,
        showChildView : view.showChildView,
    }, view), true, 'starts replying to requests');

    t.equal(bind.called, true, 'binds keyboard shortcuts');

    sand.restore();
    view.destroy();
    t.end();
});

test('notes/form/views/Form: bindKeys()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    const bind = sand.stub(Mousetrap, 'bindGlobal');

    view.bindKeys();
    t.equal(bind.calledWith(['ctrl+s', 'command+s']), true,
        'binds ctrl+s and command+s keyboard shortcuts');
    t.equal(bind.calledWith(['esc']), true,
        'binds esc keyboard shortcut');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: onRender()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    const show = sand.stub(view, 'showChildView');

    view.onRender();
    t.equal(show.calledWith('notebooks'), true, 'shows the notebooks selector');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: onAfterRender()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({configs: {editMode: 'preview'}});
    sand.stub(view.channel, 'trigger');
    view.ui = {title: {trigger: sand.stub()}};
    sand.stub(view, 'switchMode');

    view.onAfterRender();
    t.equal(view.channel.trigger.calledWith('ready'), true,
        'triggers "ready" event on the view\'s channel');
    t.equal(view.ui.title.trigger.calledWith('focus'), true,
        'focuses on the title');
    t.equal(view.switchMode.calledWith('preview'), true,
        'changes the edit mode');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: onBeforeDestroy()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    sand.stub(view, 'normalMode');
    sand.stub(view.channel, 'trigger');

    view.onBeforeDestroy();
    t.equal(view.normalMode.called, true, 'switches the edit mode to normal');
    t.equal(view.channel.trigger.calledWith('before:destroy'), true,
        'triggers before:destroy event');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: onDestroy()', t => {
    sand.stub(View.prototype, 'initialize');
    const view   = new View({});
    const unbind = sand.spy(Mousetrap, 'unbind');
    sand.spy(view.channel, 'stopReplying');

    view.onDestroy();
    t.equal(view.channel.stopReplying.called, true, 'stops replying to requests');
    t.equal(unbind.calledWith(['ctrl+s', 'command+s', 'esc']), true,
        'unbinds keyboard shortcuts');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: save()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    sand.stub(view, 'trigger');

    view.save();
    t.equal(view.options.isClosed, true);
    t.equal(view.trigger.calledWith('save'), true,
        'triggers "save" event');

    const stub = sand.stub();
    view.save({preventDefault: stub});
    t.equal(stub.called, true, 'prevents the default behavior');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: autoSave()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    sand.stub(view, 'trigger');

    view.options.isClosed = true;
    view.autoSave();
    t.equal(view.trigger.notCalled, true,
        'does nothing if isClosed property equal to true');

    view.options.isClosed = false;
    view.autoSave();
    t.equal(view.trigger.calledWith('save', {autoSave: true}), true,
        'triggers "save" event with autoSave property equal to true');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: cancel()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    view.ui    = {title: {is: sand.stub()}};
    sand.stub(view, 'trigger');

    view.ui.title.is.returns(true);
    view.cancel();
    t.equal(view.options.focus, 'title');
    t.equal(view.trigger.calledWith('cancel'), true,
        'triggers "cancel" event');

    view.ui.title.is.returns(false);
    view.cancel();
    t.equal(view.options.focus, 'editor');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: switchMode()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    view.ui    = {form: {trigger: sand.stub()}};
    sand.stub(view, 'previewMode');
    sand.stub(view.channel, 'trigger');

    view.switchMode({currentTarget: 'ok'});
    t.equal(view.ui.form.trigger.notCalled, true,
        'does nothing if the edit mode is not found');

    view.switchMode('preview');
    t.equal(view.ui.form.trigger.calledWith('click'), true,
        'makes the form active again');
    t.equal(view.previewMode.called, true, 'switches to another edit mode');
    t.equal(view.channel.trigger.calledWith('change:mode', {mode: 'preview'}), true,
        'triggers change:mode event');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: fullscreenMode()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    view.$body = {removeClass: sand.stub(), addClass: sand.stub()};
    view.$body.removeClass.returns(view.$body);

    view.fullscreenMode();
    t.equal(view.$body.removeClass.calledWith('-preview'), true,
        'removes -preview CSS class');
    t.equal(view.$body.addClass.calledWith('editor--fullscreen'), true,
        'adds editor--fullscreen CSS class');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: previewMode()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    view.$body = {addClass: sand.stub()};

    view.previewMode();
    t.equal(view.$body.addClass.calledWith('editor--fullscreen -preview'), true,
        'adds editor--fullscreen and -preview CSS classes');

    sand.restore();
    t.end();
});

test('notes/form/views/Form: normalMode()', t => {
    sand.stub(View.prototype, 'initialize');
    const view = new View({});
    view.$body = {removeClass: sand.stub()};

    view.normalMode();
    t.equal(view.$body.removeClass.calledWith('editor--fullscreen -preview'), true,
        'removes editor--fullscreen and -preview CSS classes');

    sand.restore();
    t.end();
});
