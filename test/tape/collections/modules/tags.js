/**
 * @file Test collections/modules/Tags
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';
import Module from '../../../../app/scripts/collections/modules/Tags';
import ModuleOrig from '../../../../app/scripts/collections/modules/Module';
import Tags from '../../../../app/scripts/collections/Tags';

let sand;
test('collections/modules/Tags: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Tags: Collection', t => {
    t.equal(Module.prototype.Collection, Tags,
        'uses tags collection');
    t.end();
});

test('collections/modules/Tags: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWith({addTags: mod.addTags}), true,
        'replies to addTags request');

    sand.restore();
    t.end();
});

test('collections/modules/Tags: addTags()', t => {
    const mod = new Module();
    const add = sand.stub(mod, 'addTag');
    const opt = {profileId: 'test', tags: ['tag', 'test']};

    mod.addTags(opt)
    .then(() => {
        t.equal(add.callCount, 2, 'adds all tags');
        t.equal(add.calledWithMatch({profileId: 'test', name: 'tag'}), true,
            'adds the first tag');
        t.equal(add.calledWithMatch({profileId: 'test', name: 'test'}), true,
            'adds the second tag');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Tags: addTag()', t => {
    const mod  = new Module();
    const save = sand.stub(ModuleOrig.prototype, 'saveModel');
    sand.stub(mod, 'getId').returns(Promise.resolve('testId'));

    const data = {name: 'test', profileId: 'test'};
    mod.addTag(data)
    .then(() => {
        t.equal(mod.getId.calledWith({data}), true,
            'calls "getId" method to compute sha256 of the tag');

        t.equal(save.calledWithMatch({model: {id: 'testId'}}), true,
            'creates a new model');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Tags: saveModel() - do not compute ID', t => {
    const mod  = new Module();
    const save = sand.stub(ModuleOrig.prototype, 'saveModel');
    sand.stub(mod, 'getId');

    const data = {data: {trash: 2}};
    mod.saveModel(data);

    t.equal(save.calledWith(data), true, 'saves the model');
    t.equal(mod.getId.notCalled, true, 'does not compute a new ID');

    sand.restore();
    t.end();
});

test('collections/modules/Tags: saveModel() - compute ID', t => {
    const mod   = new Module();
    const model = new mod.Model({id: 'testId', name: 'test'});
    const save  = sand.stub(ModuleOrig.prototype, 'saveModel');
    sand.stub(mod, 'remove').returns(Promise.resolve());
    sand.stub(mod, 'getId').returns(Promise.resolve('testId'));
    sand.spy(model, 'set');

    mod.saveModel({model})
    .then(() => {
        t.equal(mod.getId.calledWith({model}), true,
            'calls "getId" method to compute sha256 of the tag');

        t.equal(mod.remove.notCalled, true,
            'does not remove the model if its ID has not changed');

        t.equal(model.set.calledWith({id: 'testId'}), true, 'sets a new ID');
        t.equal(save.calledWithMatch({model}), true, 'saves the model');

        mod.getId.returns(Promise.resolve('testingId'));
        return mod.saveModel({model, data: {name: 'testing'}});
    })
    .then(() => {
        t.equal(mod.remove.calledWith({model}), true,
            'removes the model if it has a different ID');

        t.equal(model.set.calledWith({id: 'testingId'}), true, 'sets a new ID');
        t.equal(save.calledWithMatch({model}), true, 'saves the model');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Tags: getId()', t => {
    const mod   = new Module();
    const model = new mod.Model({name: 'testing'});
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve(['t', 'e']));

    mod.getId({data: {name: 'test'}})
    .then(res => {
        t.equal(res, 'te', 'returns a string');
        t.equal(req.calledWith('models/Encryption', 'sha256', {text: 'test'}),
            true, 'computes SHA256 of a tag\'s name');

        return mod.getId({model});
    })
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'sha256', {text: 'testing'}),
            true, 'computes SHA256 of a tag\'s name');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});
