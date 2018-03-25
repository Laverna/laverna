/**
 * Test components/settings/show/encryption/Passphrase
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/encryption/Passphrase';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/encryption/Passphrase: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/encryption/Passphrase: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('settings/show/encryption/Passphrase: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.oldPassphrase, '#oldPassphrase');
    t.equal(ui.newPassphrase, '#newPassphrase');
    t.equal(ui.newPassphraseRe, '#newPassphraseRe');
    t.equal(ui.helpError, '.help--error');

    t.end();
});

test('settings/show/encryption/Passphrase: ui()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click .btn--cancel'], 'destroy',
        'destroyes itself if cancel button is clicked');
    t.equal(events['click .btn--save'], 'save',
        'changes the passphrase if save button is clicked');
    t.equal(events['keyup input'], 'saveOnEnter',
        'saves the passphrase if enter is pressed');

    t.end();
});

test('settings/show/encryption/Passphrase: saveOnEnter()', t => {
    const view = new View();
    sand.stub(view, 'save');

    view.saveOnEnter({which: 2});
    t.equal(view.save.notCalled, true, 'do nothing if enter is not pressed');

    view.saveOnEnter({which: 13});
    t.equal(view.save.called, true, 'saves the passphrase if enter is pressed');

    sand.restore();
    t.end();
});

test('settings/show/encryption/Passphrase: save()', t => {
    const view = new View({model: {id: '1'}});
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());
    sand.stub(view, 'onChangeError');
    sand.stub(document.location, 'reload');
    view.ui = {
        newPassphraseRe: {val: sand.stub().returns('2')},
        newPassphrase  : {val: sand.stub().returns('1')},
        oldPassphrase  : {val: sand.stub().returns('1')},
    };

    view.save();
    t.equal(view.onChangeError.calledWith('Passwords do not match'), true,
        'does not change the passwords do not match');

    view.ui.newPassphrase.val.returns('2');
    view.save()
    .then(() => {
        t.equal(req.calledWith('collections/Profiles', 'changePassphrase', {
            model         : view.model,
            oldPassphrase : '1',
            newPassphrase : '2',
        }), true, 'changes the passphrase');

        t.equal(document.location.reload.called, true, 'reloads the page');

        req.returns(Promise.reject('error'));
        return view.save();
    })
    .then(() => {
        t.equal(view.onChangeError.calledWith('error'), true, 'shows errors');

        sand.restore();
        t.end();
    });
});

test('settings/show/encryption/Passphrase: onChangeError()', t => {
    const view = new View();
    view.ui    = {helpError: {text: sand.stub()}};
    sand.stub(_, 'i18n').callsFake(str => str);

    view.onChangeError({message: 'error'});
    t.equal(view.ui.helpError.text.notCalled, true,
        'does nothing if error argument is not string');

    view.onChangeError('error');
    t.equal(view.ui.helpError.text.calledWith('error'), true,
        'shows the error message');

    sand.restore();
    t.end();
});
