/**
 * Test components/setup/register/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../app/scripts/utils/underscore';
import ContentView from '../../../../app/scripts/components/setup/ContentView';
import View from '../../../../app/scripts/components/setup/register/View';

let sand;
test('setup/register/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/register/View: register', t => {
    t.equal(View.prototype.register, true, 'returns "true"');
    t.end();
});

test('setup/register/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.end();
});

test('setup/register/View: triggers()', t => {
    const trig = View.prototype.triggers();
    t.equal(typeof trig, 'object');
    t.equal(trig['click #welcome--previous'], 'show:username',
        'triggers "show:username"');
    t.end();
});

test('setup/register/View: onInputChange()', t => {
    const view = new View();
    view.ui    = {
        name: {val: () => 'test'},
        next: {attr: sand.stub()},
    };
    sand.stub(view, 'checkPassword').returns(true);

    view.onInputChange();
    t.equal(view.ui.next.attr.calledWith('disabled', false), true,
        'enables "next" button if name and passphrase inputs are not empty');

    sand.restore();
    t.end();
});

test('setup/register/View: checkPassword()', t => {
    const view = new View();
    view.ui    = {
        password   : {val: () => 'test'},
        passwordRe : {val: () => 'test'},
    };

    t.equal(view.checkPassword(), true, 'returns "true"');

    view.ui.passwordRe.val = () => '';
    t.equal(view.checkPassword(), false, 'returns "false" if passwords do not match');

    view.ui.password.val = () => '';
    t.equal(view.checkPassword(), false, 'returns "false" if password is empty');

    sand.restore();
    t.end();
});

test('setup/register/View: onClickNext()', t => {
    const view = new View({username: 'test'});
    const trig = sand.stub(view, 'triggerMethod');
    view.ui    = {
        name      : {val: () => 'test'},
        password  : {val: () => '1'},
        email     : {val: () => 'test@'},
    };

    view.onClickNext();
    t.equal(trig.calledWith('save', {
        username : 'test',
        register : true,
        keyData  : {
            username   : 'test',
            passphrase : '1',
        },
    }), true, 'triggers "save"');

    sand.restore();
    t.end();
});

test('setup/register/View: onSaveBefore()', t => {
    const view = new View();
    view.ui    = {form: {addClass: sand.stub()}};
    sand.stub(view, 'toggleWait');

    view.onSaveBefore();
    t.equal(view.ui.form.addClass.calledWith('hidden'), true,
        'hides "register" form');
    t.equal(view.toggleWait.called, true, 'shows "wait" message');

    sand.restore();
    t.end();
});

test('setup/register/View: onSaveError()', t => {
    const view   = new View();
    view.ui      = {form : {removeClass: sand.stub()}};
    const onSave = sand.stub(ContentView.prototype, 'onSaveError');
    sand.stub(view, 'toggleWait');

    const data   = {el: 'test'};
    view.onSaveError(data);
    t.equal(onSave.calledWith(data), true, 'calls the parent method');
    t.equal(view.ui.form.removeClass.calledWith('hidden'), true,
        'shows the "register" form');
    t.equal(view.toggleWait.called, true, 'hides "wait" message');

    sand.restore();
    t.end();
});

test('setup/register/View: toggleWait()', t => {
    const view        = new View();
    const toggleClass = sand.stub();
    const jq          = sand.stub(view, '$').withArgs('.welcome--wait');
    jq.returns({toggleClass});

    view.toggleWait();
    t.equal(toggleClass.calledWith('hidden'), true,
        'shows the waiting message');

    sand.restore();
    t.end();
});
