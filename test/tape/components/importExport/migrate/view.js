/**
 * Test: components/importExport/migrate/View.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../../app/scripts/utils/underscore';

// eslint-disable-next-line
const View = require('../../../../../app/scripts/components/importExport/migrate/View').default;

let sand;
test('importExport/migrate/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('importExport/migrate/View: className', t => {
    t.equal(View.prototype.className, 'container text-center -auth');
    t.end();
});

test('importExport/migrate/View: ui()', t => {
    t.equal(typeof View.prototype.ui(), 'object', 'returns an object');
    t.end();
});

test('importExport/migrate/View: triggers()', t => {
    const triggers = View.prototype.triggers();
    t.equal(triggers['click #migrate--cancel'], 'cancel');
    t.equal(triggers['click #migrate--start'], 'start');
    t.end();
});

test('importExport/migrate/View: serializeData()', t => {
    const options = {configs: {encrypt: 1}};
    const view    = new View(options);
    t.deepEqual(view.serializeData(), options, 'returns options');
    t.end();
});

test('importExport/migrate/View: showAlert()', t => {
    const view = new View();
    view.ui    = {
        alert: {removeClass: sand.stub()},
        alertText: {text: sand.stub()},
    };
    sand.stub(_, 'i18n').callsFake(text => text);

    view.showAlert('Warning');
    t.equal(view.ui.alert.removeClass.calledWith('hidden'), true,
        'shows the alert block');
    t.equal(view.ui.alertText.text.calledWith('Warning'), true,
        'shows the warning text');

    sand.restore();
    t.end();
});

test('importExport/migrate/View: onAuthFailure()', t => {
    const view = new View();
    sand.stub(view, 'showAlert');

    view.onAuthFailure();
    t.equal(view.showAlert.calledWith('Wrong password!'), true,
        'warns a user that authentication failed');

    sand.restore();
    t.end();
});

test('importExport/migrate/View: onMigrateStart()', t => {
    const view = new View();
    view.ui    = {
        alert    : {addClass: sand.stub()},
        confirm  : {addClass: sand.stub()},
        progress : {removeClass: sand.stub()},
    };

    view.onMigrateStart();
    t.equal(view.ui.alert.addClass.calledWith('hidden'), true,
        'hides the alert block');
    t.equal(view.ui.confirm.addClass.calledWith('hidden'), true,
        'hides the confirmation block');
    t.equal(view.ui.progress.removeClass.calledWith('hidden'), true,
        'shows the progress bar');

    sand.restore();
    t.end();
});

test('importExport/migrate/View: onMigrateCollection()', t => {
    const view = new View();
    sand.stub(_, 'i18n').callsFake(text => text);
    view.ui    = {
        progressBar  : {css: sand.stub()},
        progressText : {text: sand.stub()},
    };

    view.onMigrateCollection({type: 'notes', percent: 50});
    t.equal(view.ui.progressBar.css.calledWith({width: '50%'}), true,
        'changes the progress bar');
    t.equal(view.ui.progressText.text.calledWith('Migrating notes'), true,
        'changes the progress bar text');

    sand.restore();
    t.end();
});

test('importExport/migrate/View: onMigrateFailure()', t => {
    const view = new View();
    sand.stub(view, 'showAlert');

    view.onMigrateFailure();
    t.equal(view.showAlert.calledWith('Failed to migrate your old data!'), true,
        'shows a failure warning');

    sand.restore();
    t.end();
});
