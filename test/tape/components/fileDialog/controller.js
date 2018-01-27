/**
 * Test components/fileDialog/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import '../../../../app/scripts/utils/underscore';

import Controller from '../../../../app/scripts/components/fileDialog/Controller';

let sand;
test('fileDialog/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('fileDialog/Controller: onDestroy()', t => {
    const con     = new Controller();
    const resolve = sand.stub();
    con.promise   = {resolve};

    con.destroy();
    t.equal(resolve.called, true, 'resolves the promise');
    t.equal(con.promise, null, 'removes promise property');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(typeof con.promise, 'object', 'creates "promise" property');
    t.equal(con.show.called, true, 'renders the view');
    t.equal(con.listenToEvents.called, true, 'starts listening to events');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: show', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');

    con.show();
    t.equal(req.calledWith('Layout', 'show', {
        region : 'modal',
        view   : con.view,
    }), true, 'renders the view in "modal" region');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    con.view     = {el: '1'};

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'save', con.onSave), true,
        'listens to "save" event');
    t.equal(listen.calledWith(con.view, 'cancel'), true,
        'listens to "cancel" event');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: resolve()', t => {
    const con     = new Controller();
    const resolve = sand.stub();
    con.promise   = {resolve};
    con.view      = {destroy: sand.stub()};

    con.resolve('test');
    t.equal(resolve.calledWith('test'), true, 'resolves the promise with "text"');
    t.equal(con.promise, null, 'removes the promise');
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: onSave()', t => {
    const con = new Controller();
    con.view  = {
        ui      : {url: {val: () => 'test'}},
        destroy : sand.stub(),
    };
    sand.stub(con, 'resolve');
    sand.stub(con, 'makeText').returns('text');
    sand.stub(con, 'saveFiles');

    con.onSave();
    t.equal(con.resolve.calledWith('text'), true, 'resolves with the link');
    t.equal(con.makeText.calledWith('test'), true,
        'calls "makeText" method to make a Markdown link');

    con.view.ui.url.val = () => '';
    con.view.files = ['1'];
    con.onSave();
    t.equal(con.saveFiles.called, true,
        'saves the files if the array is not empty');

    con.view.files = [];
    con.onSave();
    t.equal(con.view.destroy.called, true,
        'destroyes the view if nothing was provided');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: makeText()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    const opt = {
        url  : 'url',
        text : 'Alt description',
    };

    con.makeText('url', true);
    t.equal(req.calledWith('components/editor', 'makeLink', opt), true,
        'makes "makeLink" request if isFile is equal to true');

    con.makeText('url');
    t.equal(req.calledWith('components/editor', 'makeImage', opt), true,
        'makes "makeImage" request if isFile is equal to false');

    sand.restore();
    t.end();
});

test('fileDialog/Controller: saveFiles()', t => {
    const model = new Backbone.Model({fileModels: ['1']});
    const con = new Controller({model});
    const req = sand.stub(Radio, 'request');
    con.view  = {files: ['2']};
    sand.stub(model, 'set');
    sand.stub(con, 'attachFiles');

    req.withArgs('collections/Files').returns(Promise.resolve(['2']));
    req.withArgs('utils/Url').returns('test');

    const res = con.saveFiles();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(req.calledWith('collections/Files', 'addFiles', {
        files     : con.view.files,
    }), true, 'saves the files');

    res.then(() => {
        t.equal(model.set.calledWithMatch('fileModels', ['1', '2']), true,
            'changes "fileModels" attribute');
        t.equal(con.attachFiles.calledWithMatch(['2']), true,
            'calls "attachFiles" method');

        sand.restore();
        t.end();
    });
});

test('fileDialog/Controller: attachFiles()', t => {
    const model = new Backbone.Model({fileModels: ['1']});
    const con = new Controller();
    const req = sand.stub(Radio, 'request').returns('url');
    sand.stub(con, 'makeText');
    sand.stub(con, 'resolve');

    const files = [
        new Backbone.Model({fileType: 'image/png'}),
        new Backbone.Model({fileType: 'text'}),
    ];

    con.attachFiles(files);
    t.equal(req.calledWith('utils/Url', 'getFileLink', {model: files[0]}), true,
        'makes "getFileLink" request');
    t.equal(con.makeText.calledWith('url', false), true,
        'generates Markdown image code');
    t.equal(con.makeText.calledWith('url', true), true,
        'generates Markdown link code');

    t.equal(con.resolve.called, true, 'resolves the promise');

    sand.restore();
    t.end();
});
