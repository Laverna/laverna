/**
 * @file Test collections/modules/Tags
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Module from '../../../../app/scripts/collections/modules/Tags';
import ModuleOrig from '../../../../app/scripts/collections/modules/Module';
import Tags from '../../../../app/scripts/collections/Tags';

let sand;
test('Tags: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Tags: Collection', t => {
    t.equal(Module.prototype.Collection, Tags,
        'uses tags collection');
    t.end();
});

test('Tags: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWith({addTags: mod.addTags}), true,
        'replies to addTags request');

    sand.restore();
    t.end();
});

test('Tags: addTags()', t => {
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

test('Tags: addTag()', t => {
    const mod   = new Module();
    const reply = sand.stub().returns(Promise.resolve(['t', 'est']));
    const model = new mod.Model({id: 'test', name: 'test'});
    sand.stub(mod, 'findModel').returns(model);
    sand.stub(mod, 'saveModel').returns(model);

    Radio.reply('encrypt', 'sha256', reply);

    mod.addTag({name: 'test', profileId: 'test'})
    .then(() => {
        t.equal(reply.calledWith({text: 'test'}), true,
            'creates the ID by calculating sha256 of the name');
        t.equal(mod.findModel.calledWithMatch({profileId: 'test', id: 'test'}), true,
            'checks if a tag with the same name already exists');
        t.equal(mod.saveModel.notCalled, true,
            'does not create a new tag if there is already a tag with the same name');

        mod.findModel.returns(null);
        return mod.addTag({name: 'test', profileId: 'test'});
    })
    .then(() => {
        t.equal(mod.saveModel.called, true, 'creates a new model');

        Radio.channel('encrypt').stopReplying();
        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Tags: saveModel()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: 'test', name: 'test'});
    const save  = sand.stub(ModuleOrig.prototype, 'saveModel');
    sand.stub(mod, 'remove').returns(Promise.resolve());

    const reply = sand.stub().returns(Promise.resolve(['t', 'est']));
    Radio.reply('encrypt', 'sha256', reply);

    mod.saveModel({model})
    .then(() => {
        t.equal(mod.remove.notCalled, true,
            'does not remove the model if its ID has not changed');
        t.equal(save.calledWithMatch({model}), true, 'saves the model');

        reply.returns(Promise.resolve(['te', 'sting']));
        return mod.saveModel({model});
    })
    .then(() => {
        t.equal(mod.remove.calledWith({model}), true,
            'removes the model if it has a different ID');
        t.equal(save.calledWithMatch({model}), true, 'saves the model');

        Radio.channel('encrypt').stopReplying();
        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});
