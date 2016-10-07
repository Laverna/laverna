/**
 * @file Test collections/modules/Files
 */
import test from 'tape';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import ModuleOrig from '../../../../app/scripts/collections/modules/Module';
import Files from '../../../../app/scripts/collections/Files';

const toBlob = sinon.stub().returns('blob');
const Module  = proxyquire('../../../../app/scripts/collections/modules/Files', {
    'blueimp-canvas-to-blob': toBlob,
}).default;

let sand;
test('Files: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Files: Collection', t => {
    t.equal(Module.prototype.Collection, Files, 'uses files collection');
    t.end();
});

test('Files: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWith({findFiles: mod.findFiles, addFiles: mod.addFiles}), true,
        'replies to getFiles and addFiles request');

    sand.restore();
    t.end();
});

test('Files: findFiles()', t => {
    const mod  = new Module();
    const find = sand.stub(mod, 'findModel').returns({id: '1'});

    mod.findFiles({ids: ['test', 'test2'], profileId: 'test'})
    .then(res => {
        t.equal(find.callCount, 2, 'fetches all models');
        t.equal(find.calledWith({profileId: 'test', id: 'test'}), true,
            'fetches the first model');
        t.equal(find.calledWith({profileId: 'test', id: 'test2'}), true,
            'fetches the second model');
        t.equal(Array.isArray(res), true, 'returns an array');
        t.equal(typeof res[0], 'object', 'the array consists of objects');
        t.equal(res[0].id, '1', 'is a model');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Files: saveModel()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: 'test', src: 'file-src'});
    const save  = sand.stub(ModuleOrig.prototype, 'saveModel');

    mod.saveModel({model});
    t.equal(toBlob.calledWith('file-src'), true, 'converts "src" property to blob');
    t.equal(save.calledWithMatch({model, data: {src: 'blob'}}), true,
        'saves the model');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('Files: addFiles()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel').returns(Promise.resolve());

    mod.addFiles({files: [{src: 'test1'}, {src: 'test2'}], profileId: 'test'})
    .then(models => {
        t.equal(save.callCount, 2, 'saves all file models');
        t.equal(save.calledWithMatch({data: {src: 'test1'}}), true,
            'saves the first file');
        t.equal(save.calledWithMatch({data: {src: 'test2'}}), true,
            'saves the second file');
        t.equal(Array.isArray(models), true, 'resolves with an array');
        t.equal(typeof models[0], 'object', 'the array contains objects');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});
