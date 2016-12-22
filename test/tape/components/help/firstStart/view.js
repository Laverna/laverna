/**
 * Test components/help/firstStart/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import Configs from '../../../../../app/scripts/collections/Configs';
import View from '../../../../../app/scripts/components/help/firstStart/View';
/* eslint-enable */

let sand;
test('help/firstStart/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('help/firstStart/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('help/firstStart/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.end();
});

test('help/firstStart/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(typeof triggers, 'object');

    t.equal(triggers['click #welcome--import'], 'import',
        'triggers "import" event if the button is clicked');

    t.equal(triggers['click @ui.saveBtn'], 'save',
        'triggers "save" event if the button is clicked');

    t.equal(triggers['click #welcome--export'], 'download',
        'triggers "download" event if the button is clicked');

    t.end();
});

test('help/firstStart/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['keyup @ui.email'], 'onInputChange');
    t.equal(events['keyup input[type=password]'], 'onInputChange');

    t.equal(events['click #welcome--next'], 'onNext',
        'calls "onNext" method if "next" button is clicked');

    t.equal(events['click #welcome--previous'], 'onPrevious',
        'calls "onPrevious" method if "previous" button is clicked');

    t.equal(events['click #welcome--last'], 'destroy',
        'destroyes itself if the last button is clicked');

    t.end();
});

test('help/firstStart/View: onInputChange()', t => {
    const view = new View();
    sand.stub(view, 'checkForm');

    view.onInputChange();
    t.equal(view.checkForm.called, true, 'calls "checkForm" method');

    sand.restore();
    t.end();
});

test('help/firstStart/View: checkForm()', t => {
    const view = new View();
    view.ui    = {
        email   : {val: sand.stub().returns('test@example.com')},
        saveBtn : {removeAttr : sand.stub(), attr                         : sand.stub()},
    };
    sand.stub(view, 'checkPassword').returns(true);

    view.checkForm();
    t.equal(view.ui.saveBtn.removeAttr.calledWith('disabled'), true,
        'makes the "save" button clickable if validation was successful');

    view.checkPassword.returns(false);
    view.checkForm();
    t.equal(view.ui.saveBtn.attr.calledWith('disabled'), true,
        'makes the "save" button unclickable if validation was not successful');

    sand.restore();
    t.end();
});

test('help/firstStart/View: checkPassword()', t => {
    const view = new View();
    view.ui    = {
        password   : {val : sand.stub().returns('test')},
        passwordRe : {val : sand.stub().returns('test')},
    };

    t.equal(view.checkPassword(), true, 'returns true');

    view.ui.passwordRe.val.returns('');
    t.equal(view.checkPassword(), false, 'returns false if passwords do not match');

    view.ui.password.val.returns('');
    t.equal(view.checkPassword(), false, 'returns false if the password is empty');

    sand.restore();
    t.end();
});

test('help/firstStart/View: onPrevious()', t => {
    const view = new View();
    view.ui    = {
        page     : {removeClass : sand.stub()},
        settings : {addClass    : sand.stub()},
    };

    view.onPrevious();
    t.equal(view.ui.page.removeClass.calledWith('hidden'), true,
        'shows the first page');

    t.equal(view.ui.settings.addClass.calledWith('hidden'), true,
        'hides settings page');

    sand.restore();
    t.end();
});

test('help/firstStart/View: onNext()', t => {
    const view = new View();
    view.ui    = {
        page     : {addClass    : sand.stub()},
        settings : {removeClass : sand.stub()},
    };

    view.onNext();
    t.equal(view.ui.page.addClass.calledWith('hidden'), true,
        'hides the first page');
    t.equal(view.ui.settings.removeClass.calledWith('hidden'), true,
        'shows settings page');

    sand.restore();
    t.end();
});

test('help/firstStart/View: onSaveBefore()', t => {
    const view = new View();
    view.ui    = {
        settings : {addClass    : sand.stub()},
        wait     : {removeClass : sand.stub()},
    };

    view.onSaveBefore();
    t.equal(view.ui.settings.addClass.calledWith('hidden'), true,
        'hides settings page');

    t.equal(view.ui.wait.removeClass.calledWith('hidden'), true,
        'shows "wait" page');

    sand.restore();
    t.end();
});

test('help/firstStart/View: onSaveAfter()', t => {
    const view = new View();
    view.ui    = {wait: {addClass: sand.stub()}};

    const removeClass = sand.stub();
    sand.stub(view, '$').withArgs('#welcome--backup')
    .returns({removeClass});

    view.onSaveAfter();
    t.equal(view.ui.wait.addClass.calledWith('hidden'), true,
        'hides "wait" page');
    t.equal(removeClass.calledWith('hidden'), true,
        'shows backup page');

    sand.restore();
    t.end();
});
