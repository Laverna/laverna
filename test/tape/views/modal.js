/**
 * Test views/Modal
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import Modal from '../../../app/scripts/views/Modal';
const modal = Modal.prototype;

let sand;
test('views/Modal: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('views/Modal: channel', t => {
    t.equal(modal.channel.channelName, 'views/Modal');
    t.end();
});

test('views/Modal: onShow()', t => {
    modal.currentView = {
        $el: {
            modal : sand.stub(),
            on    : sand.stub(),
        },
    };
    const trig = sand.stub(modal.channel, 'trigger');

    modal.onShow();
    t.equal(modal.currentView.$el.modal.calledWith({
        show     : true,
        backdrop : 'static',
        keyboard : true,
    }), true, 'shows modal window');

    t.equal(modal.currentView.$el.on.calledWith('shown.bs.modal'), true,
        'listens to shown.bs.modal event');
    t.equal(modal.currentView.$el.on.calledWith('hidden.bs.modal'), true,
        'listens to hidden.bs.modal event');
    t.equal(trig.calledWith('shown'), true, 'triggers "shown" event on the channel');

    modal.currentView = null;
    sand.restore();
    t.end();
});

test('views/Modal: onModalShown()', t => {
    modal.currentView = {triggerMethod: sand.stub()};

    modal.onModalShown();
    t.equal(modal.currentView.triggerMethod.calledWith('shown:modal'), true,
        'triggers shown:modal event');

    modal.currentView = null;
    t.end();
});

test('views/Modal: onModalHidden()', t => {
    sand.stub(modal, 'empty');

    modal.onModalHidden();
    t.equal(modal.empty.called, true, 'empties itself');

    sand.restore();
    t.end();
});

test('views/Modal: onBeforeEmpty()', t => {
    modal.currentView = {$el: {off: sand.stub(), modal: sand.stub()}};
    const trig        = sand.stub(modal.channel, 'trigger');
    sand.stub(modal, 'removeBackdrop');

    modal.onBeforeEmpty();
    t.equal(modal.currentView.$el.off.calledWith([
        'hidden.bs.modal',
        'shown.bs.modal',
    ]), true, 'stops listening to modal window events');
    t.equal(modal.currentView.$el.modal.calledWith('hide'), true,
        'hides the modal window');
    t.equal(modal.removeBackdrop.called, true, 'removes the backdrop');
    t.equal(trig.calledWith('hidden'), true, 'triggers "hidden" event on the channel');

    sand.restore();
    t.end();
});
