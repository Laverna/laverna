/**
 * Test components/setup/username/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
// import Radio from 'backbone.radio';

import _ from '../../../../app/scripts/utils/underscore';
import ContentView from '../../../../app/scripts/components/setup/ContentView';
import View from '../../../../app/scripts/components/setup/username/View';
import {configNames} from '../../../../app/scripts/collections/configNames';

let sand;
test('setup/username/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/username/View: importChannel', t => {
    t.equal(View.prototype.importChannel.channelName, 'components/importExport');
    t.end();
});

test('setup/username/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.end();
});

test('setup/username/Username: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click #welcome--import'], 'triggerImport');
    t.equal(events['change #import--data'], 'importData');
    t.end();
});

test('setup/username/Username: triggers()', t => {
    const trig = View.prototype.triggers();
    t.equal(typeof trig, 'object');
    t.equal(trig['click #welcome--auth'], 'go:auth');
    t.end();
});

test('setup/username/Username: serializeData()', t => {
    const view = new View({newIdentity: true});
    t.deepEqual(view.serializeData(), {
        newIdentity  : true,
        signalServer : configNames.sync.signalServer,
    });
    t.end();
});

test('setup/username/Username: initialize()', t => {
    const stub = sand.stub(View.prototype, 'listenTo');
    const view = new View();

    t.equal(stub.calledWith(view.importChannel, 'completed', view.showImportMessage),
        true, 'listens to importExport component\'s "completed" event');

    sand.restore();
    t.end();
});

test('setup/username/Username: triggerImport()', t => {
    const view = new View();
    view.ui    = {importInput: {click: sand.stub()}};
    const preventDefault = sand.stub();

    view.triggerImport({preventDefault});
    t.equal(preventDefault.called, true, 'prevents the default behaviour');
    t.equal(view.ui.importInput.click.called, true, 'triggers click on the file field');

    sand.restore();
    t.end();
});

test('setup/username/Username: importData()', t => {
    const view   = new View();
    const target = {files: [1, 2]};
    const req    = sand.stub(view.importChannel, 'request');
    view.ui      = {
        signalServer : {val: () => 'localhost'},
        username     : {val: () => 'alice'},
    };

    view.importData({target: {files: []}});
    t.equal(req.notCalled, true, 'does nothing if there are no files');

    view.importData({target});
    t.equal(req.calledWith('import', {
        files        : target.files,
        signalServer : 'localhost',
        username     : 'alice',
    }), true, 'tries to import data to the current device');

    sand.restore();
    t.end();
});

test('setup/username/View: showImportMessage()', t => {
    const view = new View();
    sand.stub(_, 'i18n').callsFake(str => str);
    sand.stub(view, 'showWarning');

    view.showImportMessage({msg: 'Import success'});
    t.equal(view.showWarning.calledWith('Import success'), true,
        'shows a success message');

    sand.restore();
    t.end();
});

test('setup/username/View: onInputChange()', t => {
    const view = new View();
    const attr = sand.stub();
    view.ui    = {next: {attr}, username: {val: () => 'Test'}};

    view.onInputChange();
    t.equal(attr.calledWith('disabled', false), true, 'enables "next" button');

    view.ui.username.val = () => '';
    view.onInputChange();
    t.equal(attr.calledWith('disabled', true), true, 'disables "next" button');

    sand.restore();
    t.end();
});

test('setup/username/View: onClickNext()', t => {
    const view = new View();
    const trig = sand.stub(view, 'triggerMethod');
    view.ui    = {
        username     : {val: () => 'user'},
        signalServer : {val: () => 'https://laverna.cc'},
    };

    view.onClickNext();
    t.equal(trig.calledWith('check:user', {
        username     : 'user',
        signalServer : 'https://laverna.cc',
    }), true, 'triggers "check:user"');

    sand.restore();
    t.end();
});

test('setup/username/View: onSignalServerError()', t => {
    const view = new View();
    sand.stub(view, 'showWarning');

    view.onSignalServerError({err: {status: 0}});
    t.equal(view.showWarning.calledWith('Signal server error #0'), true,
        'shows a warning message');

    sand.restore();
    t.end();
});

test('setup/username/View: onNameTaken()', t => {
    const view = new View();
    const user = {username: 'test', publicKey: 'pub'};
    view.ui    = {btnImport : {removeClass: sand.stub()}};
    sand.stub(view, 'showWarning');

    view.onNameTaken({user});
    t.equal(view.options.user, user, 'creates "user" property');
    t.equal(view.ui.btnImport.removeClass.calledWith('hidden'), true,
        'shows the "import" button');
    t.equal(view.showWarning.called, true, 'changes warning message');

    sand.restore();
    t.end();
});

test('setup/username/View: onReadyKey()', t => {
    const user = {username: 'test', publicKey: 'pub', fingerprint: 'print'};
    const view = new View({user});
    const key  = {primaryKey: {fingerprint: 'print!'}};
    const stub = sand.stub(ContentView.prototype, 'onReadyKey');
    sand.stub(view, 'showWarning');

    view.onReadyKey({key});
    t.equal(view.showWarning.calledWith('Setup: wrong key'), true,
        'changes the warning message that the fingerprints do not match');

    key.primaryKey.fingerprint = 'print';
    view.onReadyKey({key});
    t.equal(stub.calledWith({key}), true,
        'calls the parent method if the fingerprints match');

    sand.restore();
    t.end();
});
