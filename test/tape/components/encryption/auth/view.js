/**
 * Test components/encryption/auth/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import '../../../../../app/scripts/utils/underscore';

import View from '../../../../../app/scripts/components/encryption/auth/View';
import Profiles from '../../../../../app/scripts/collections/Profiles';

let sand;
test('encryption/auth/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('encryption/auth/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.password, 'input[name=password]');
    t.equal(ui.btn, '.btn[type=submit]');

    t.end();
});

test('encryption/auth/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object');
    t.equal(triggers['submit .form-wrapper'], 'submit',
        'triggers "submit" event');
    t.equal(triggers['click .btn--setup'], 'setup',
        'triggers "setup" event');

    t.end();
});

test('encryption/auth/View: onReady()', t => {
    const view = new View();
    view.ui    = {
        btn      : {css   : sand.stub()},
        password : {focus : sand.stub()},
    };

    view.onReady();
    t.equal(view.ui.btn.css.calledWith('position', 'relative'), true,
        'changes the submit button\'s "position" attribute');
    t.equal(view.ui.password.focus.called, true, 'focuses on password input');

    sand.restore();
    t.end();
});

test('encryption/auth/View: onAuthError()', t => {
    const view  = new View();
    const focus = sand.stub();
    view.ui     = {password: {val: sand.stub().returns({focus})}};
    sand.stub(view, 'animateBtn').returns(view);

    view.onAuthError();
    t.equal(view.ui.password.val.calledWith(''), true,
        'empties the password value');
    t.equal(view.animateBtn.callCount, 2, 'animates the submit button');

    sand.restore();
    t.end();
});

test('encryption/auth/View: animateBtn()', t => {
    const view = new View();
    view.ui    = {btn: {animate: () => {}}};
    sand.stub(view.ui.btn, 'animate').returns(view.ui.btn);

    t.equal(view.animateBtn(), view, 'returns itself');
    t.equal(view.ui.btn.animate.callCount, 3, 'shakes the button');

    sand.restore();
    t.end();
});
