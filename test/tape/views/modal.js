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

test('views/Modal: onShow()', t => {
    modal.currentView = {
        $el: {
            modal : sand.stub(),
            on    : sand.stub(),
        },
    };

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

    modal.currentView = null;
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
    sand.stub(modal, 'removeBackdrop');

    modal.onBeforeEmpty();
    t.equal(modal.currentView.$el.off.calledWith([
        'hidden.bs.modal',
        'shown.bs.modal',
    ]), true, 'stops listening to modal window events');
    t.equal(modal.currentView.$el.modal.calledWith('hide'), true,
        'hides the modal window');
    t.equal(modal.removeBackdrop.called, true, 'removes the backdrop');

    sand.restore();
    t.end();
});
