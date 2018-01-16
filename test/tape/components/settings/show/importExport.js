/**
 * Test components/settings/show/importExport/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/importExport/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/importExport/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/importExport/View: channel', t => {
    t.equal(View.prototype.channel.channelName, 'components/importExport');
    t.end();
});

test('settings/show/importExport/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['click .btn--import'], 'triggerClick',
        'triggers click on the file button if an import button is clicked');
    t.equal(events['change #import--data'], 'importData',
        'imports data if a file was chosen');
    t.equal(events['change #import--evernote'], 'importEvernote',
        'imports from Evernote');
    t.equal(events['click #export--data'], 'exportData',
        'exports everything if the button is clicked');
    t.equal(events['click #export--key'], 'exportKey',
        'exports the private key if the button is clicked');

    t.end();
});

test('settings/show/importExport/View: triggerClick()', t => {
    const view = new View();
    const jq   = sand.stub(view, '$');
    jq.withArgs('test').returns({attr: () => '#test-file'});
    const click = sand.stub();
    jq.withArgs('#test-file').returns({click});

    const preventDefault = sand.stub();
    view.triggerClick({preventDefault, currentTarget: 'test'});
    t.equal(preventDefault.called, true, 'prevents the default behavior');
    t.equal(click.called, true, 'clicks on the file input');

    sand.restore();
    t.end();
});

test('settings/show/importExport/View: importData() + importEvernote()', t => {
    const view = new View();
    const req  = sand.stub(view.channel, 'request');

    view.importData({target: {files: []}});
    t.equal(req.notCalled, true, 'does nothing if there are no files');

    view.importData({target: {files: [1, 2]}});
    t.equal(req.calledWith('import', {files: [1, 2]}), true,
        'imports data from the selected ZIP files');

    view.importEvernote({target: {files: [1, 2]}});
    t.equal(req.calledWith('importEvernote', {files: [1, 2]}), true,
        'imports from Evernote backup');

    sand.restore();
    t.end();
});

test('settings/show/importExport/View: exportData()', t => {
    const view = new View();
    const req  = sand.stub(view.channel, 'request');

    view.exportData();
    t.equal(req.calledWith('export'), true, 'exports everything from Laverna');

    sand.restore();
    t.end();
});

test('settings/show/importExport/View: exportKey()', t => {
    const coll = new Configs(null, {profileId: 'test'});
    const view = new View({collection: coll});
    const req  = sand.stub(view.channel, 'request');

    view.exportKey();
    t.equal(req.calledWith('export', {exportKey: true}), true,
        'exports only the private key');

    sand.restore();
    t.end();
});
