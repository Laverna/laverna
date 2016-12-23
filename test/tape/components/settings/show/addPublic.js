/**
 * Test components/settings/show/encryption/AddPublic
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/encryption/AddPublic';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/encryption/AddPublic: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/encryption/AddPublic: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('settings/show/encryption/AddPublic: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.publicKey, '#publicKey');
    t.equal(ui.alert, '.alert');

    t.end();
});

test('settings/show/encryption/AddPublic: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['click .btn--cancel'], 'destroy',
        'destroyes itself if cancel button is clicked');
    t.equal(events['click .btn--save'], 'save',
        'saves the public key if the button is clicked');

    t.end();
});

test('settings/show/encryption/AddPublic: onShownModal()', t => {
    const view = new View();
    view.ui    = {publicKey: {focus: sand.stub()}};

    view.onShownModal();
    t.equal(view.ui.publicKey.focus.called, true,
        'focuses on "publicKey" textarea');

    sand.restore();
    t.end();
});

test('Addpublic: save()', t => {
    const view = new View({model: {id: '1'}});
    view.ui    = {publicKey: {val: () => 'pub'}};
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());
    sand.stub(view, 'destroy');
    sand.stub(view, 'onSaveError');

    view.save()
    .then(() => {
        t.equal(req.calledWithMatch('collections/Configs', 'addPublicKey', {
            publicKey: 'pub',
            model    : view.model,
        }), true, 'saves the public key');

        t.equal(view.destroy.called, true, 'destroyes itself after saving the key');

        req.returns(Promise.reject('error'));
        return view.save();
    })
    .then(() => {
        t.equal(view.onSaveError.calledWith('error'), true,
            'calls "onSaveError" method on error');

        sand.restore();
        t.end();
    });
});

test('settings/show/encryption/AddPublic: onSaveError()', t => {
    const view        = new View({model: {id: '1'}});
    const removeClass = sand.stub();
    view.ui           = {
        alert    : {text: sand.stub().returns({removeClass})},
        publicKey: {focus: sand.stub()},
    };

    view.onSaveError('error');
    t.equal(view.ui.alert.text.calledWith('error'), true,
        'changes the text of the error block');

    t.equal(removeClass.calledWith('hidden'), true, 'shows the error');
    t.equal(view.ui.publicKey.focus.called, true,
        'focuses on "publicKey" textarea');

    sand.restore();
    t.end();
});
