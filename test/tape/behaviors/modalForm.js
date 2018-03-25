/**
 * Test behaviors/ModelForm.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Mn from 'backbone.marionette';

import ModalForm from '../../../app/scripts/behaviors/ModalForm';

class View extends Mn.View {
    behaviors() {
        return [ModalForm];
    }
}

let sand;
test('behaviors/ModalForm: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('behaviors/ModalForm: uiFocus', t => {
    ModalForm.prototype.view = {};
    t.equal(ModalForm.prototype.uiFocus, 'name');

    ModalForm.prototype.view.uiFocus = 'parentId';
    t.equal(ModalForm.prototype.uiFocus, 'parentId');

    ModalForm.prototype.view = null;
    t.end();
});

test('behaviors/ModalForm: triggers()', t => {
    const triggers = ModalForm.prototype.triggers();
    t.equal(typeof triggers, 'object', 'returns an object');
    t.equal(triggers['submit form'], 'save', 'triggers save event on form submit');
    t.equal(triggers['click .ok'], 'save',
        'triggers save event if save button is clicked');
    t.equal(triggers['click .cancelBtn'], 'cancel',
        'triggers cancel event if cancel button is clicked');

    t.end();
});

test('behaviors/ModalForm: modelEvents()', t => {
    const modelEvents = ModalForm.prototype.modelEvents();
    t.equal(typeof modelEvents, 'object', 'returns an object');
    t.equal(modelEvents.invalid, 'showErrors', 'shows validation errors');

    t.end();
});

test('behaviors/ModalForm: onShownModal()', t => {
    const view = new View();
    view.ui    = {name: {focus: sand.stub()}};

    const modal = ModalForm.prototype;
    modal.view  = view;
    modal.onShownModal();
    t.equal(view.ui.name.focus.called, true, 'focuses on a form element');

    modal.view = null;
    t.end();
});

test('behaviors/ModalForm: closeOnEsc()', t => {
    const view  = new View();
    sand.stub(view, 'trigger');
    const modal = ModalForm.prototype;
    modal.view  = view;

    modal.closeOnEsc({which: 10});
    t.equal(view.trigger.notCalled, true,
        'does nothing if escape key is not pressed');

    modal.closeOnEsc({which: 27});
    t.equal(view.trigger.calledWith('cancel'), true,
        'triggers cancel event if escape is pressed');

    modal.view = null;
    t.end();
});

test('behaviors/ModalForm: showErrors()', t => {
    const view     = new View({model: {storeName: 'notes'}});
    const addClass = sand.stub();
    view.ui        = {
        name: {
            parent : sand.stub().returns({addClass}),
        },
    };
    const modal    = ModalForm.prototype;
    modal.view     = view;

    modal.showErrors({errors: ['name']});
    t.equal(addClass.calledWith('has-error'), true,
        'adds "has-error" class');

    modal.view = null;
    t.end();
});
