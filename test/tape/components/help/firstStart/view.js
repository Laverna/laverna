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
    t.equal(triggers['click #welcome--save'], 'save',
        'triggers "save" event if the button is clicked');
    t.equal(triggers['click #welcome--export'], 'download',
        'triggers "download" event if the button is clicked');

    t.end();
});

test('help/firstStart/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click #welcome--next'], 'onNext',
        'calls "onNext" method if "next" button is clicked');
    t.equal(events['click #welcome--last'], 'destroy',
        'destroyes itself if the last button is clicked');

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

test('help/firstStart/View: onSaveAfter()', t => {
    const view = new View();
    view.ui    = {
        settings : {addClass    : sand.stub()},
        backup   : {removeClass : sand.stub()},
    };

    view.onSaveAfter();
    t.equal(view.ui.settings.addClass.calledWith('hidden'), true,
        'hides settings page');
    t.equal(view.ui.backup.removeClass.calledWith('hidden'), true,
        'shows backup page');

    sand.restore();
    t.end();
});
