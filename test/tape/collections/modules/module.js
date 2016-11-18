/**
 * @file Test collections/modules/Module
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import ModuleObj from '../../../../app/scripts/collections/modules/Module';
import Notes from '../../../../app/scripts/collections/Notes';

class Module extends ModuleObj {
    get Collection() {
        return Notes;
    }
}

let sand;
test('Module: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Module: Collection', t => {
    t.equal(ModuleObj.prototype.Collection, null, 'is equal to null for default');
    t.equal(Module.prototype.Collection, Notes);
    t.end();
});

test('Module: Model', t => {
    t.equal(Module.prototype.Model, Notes.prototype.model);
    t.end();
});

test('Module: idAttribute', t => {
    t.equal(Module.prototype.idAttribute, Notes.prototype.model.prototype.idAttribute);
    t.end();
});

test('Module: channel', t => {
    t.equal(Module.prototype.channel, Notes.prototype.channel);
    t.equal(typeof Module.prototype.channel, 'object');
    t.end();
});

test('Module: constructor()', t => {
    const spy = sand.spy(Module.prototype.channel, 'reply');
    const mod = new Module();

    const requests = [
        'findModel', 'find', 'saveModel', 'saveModelObject',
        'saveFromArray', 'remove',
    ];

    requests.forEach(request => {
        t.equal(spy.calledWithMatch({[request]: mod[request]}), true,
            `starts listening to '${request}' request`);
    });

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('Module: findModel() - no ID', t => {
    const mod = new Module();
    const res = mod.findModel({});

    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(model => {
        t.equal(model.id, undefined);
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: findModel() - finds a cached model', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection(null, {profileId: 'test'});
    mod.collection.add({id: '1'});

    mod.findModel({id: '1', profileId: 'test'})
    .then(model => {
        t.equal(model.id, '1');

        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: findModel() - fetches a model', t => {
    const mod     = new Module();
    const fetch   = sand.stub(mod.Model.prototype, 'fetch').returns(Promise.resolve(''));
    const decrypt = sand.stub(mod, 'decryptModel');

    mod.findModel({id: '1', profileId: 'test'})
    .then(() => {
        t.equal(fetch.called, true, 'calls fetch method');
        t.equal(decrypt.calledAfter(fetch), true, 'decrypts the fetched model');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Module: find()', t => {
    const mod     = new Module();
    const res     = mod.find();
    const decrypt = sand.stub(mod, 'decryptCollection', coll => coll);

    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(collection => {
        t.equal(typeof collection, 'object', 'returns an object');
        t.equal(decrypt.calledWith(collection), true, 'decrypts the collection');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Module: find() - filter', t => {
    const mod = new Module();
    sand.stub(mod, 'decryptCollection', coll => coll);

    mod.find({filter: 'active'})
    .then(collection => {
        t.equal(mod.collection, collection);
        t.equal(collection.conditionFilter, 'active');
        t.deepEqual(collection.currentCondition, collection.conditions.active);

        return mod.find({filter: 'notebook', query: '1'});
    })
    .then(collection => {
        t.equal(collection.conditionFilter, 'notebook');
        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: saveModel()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1'});

    sand.stub(model, 'setEscape');
    sand.stub(mod, 'encryptModel').returns(Promise.resolve());
    sand.stub(model, 'save');
    sand.stub(mod.channel, 'trigger');

    const res = mod.saveModel({model, data: {title: 'Test'}});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(mod.encryptModel.calledWith(model), true,
            'encrypts the model');
        t.equal(model.save.calledWith(model.attributes, {validate: false}), true,
            'saves the model');
        t.equal(mod.channel.trigger.calledWith('save:model', {model}), true,
            'triggers save:model event');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Module: saveModel() - validate', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1'});
    sand.spy(model, 'trigger');

    mod.saveModel({model})
    .catch(err => {
        t.equal(err, 'Validation error');
        t.equal(model.trigger.calledWith('invalid'), true,
            'triggers "invalid" event');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: save()', t => {
    const mod        = new Module();
    const collection = new mod.Collection([{id: '1'}, {id: '2'}, {id: '3'}]);

    sand.stub(mod, 'saveModel').returns(Promise.resolve());
    sand.stub(mod.channel, 'trigger');

    const res = mod.save({collection});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(mod.saveModel.callCount, 3, 'saves all models');
        t.equal(mod.channel.trigger.calledWith('save:collection', {collection}), true,
            'triggers "save:collection" event');

        mod.collection = collection;
        return mod.save();
    })
    .then(() => {
        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: saveModelObject()', t => {
    const mod  = new Module();
    const data = {id: '1', title: 'Test'};

    const trigger = sand.stub(mod.channel, 'trigger');
    sand.stub(mod, 'decryptModel').returns(Promise.resolve());
    sand.stub(mod, 'saveModel').returns(Promise.resolve());

    const res = mod.saveModelObject({data, profileId: 'test'});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(mod.decryptModel.calledWithMatch({id: '1'}), true,
            'decrypts the data');
        t.equal(mod.saveModel.calledAfter(mod.decryptModel), true,
            'saves after decrypting');
        t.equal(mod.saveModel.calledWithMatch({model: {id: '1'}}), true,
            'saves the model');
        t.equal(trigger.calledWith('save:object:1'), true,
            'triggers "save:object:1" event');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: saveFromArray()', t => {
    const mod    = new Module();
    const values = [
        {id: '1', title: 'Test 1'},
        {id: '2', title: 'Test 2'},
    ];

    const stub = sand.stub(mod, 'saveModelObject').returns(Promise.resolve());
    const res  = mod.saveFromArray({values, profileId: 'test'});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(stub.callCount, 2, 'saves all models');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: remove() - model', t => {
    const mod   = new Module();
    const model = {id: '1'};

    sand.stub(mod, 'saveModel').returns(Promise.resolve());
    sand.stub(mod.channel, 'trigger');

    const res = mod.remove({model});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(mod.saveModel.calledWithMatch({model, data: {trash: 2}}), true,
            'changes trash status');
        t.equal(mod.channel.trigger.calledWithMatch('destroy:model', {model}), true,
            'triggers destroy:model event');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Module: remove() - ID', t => {
    const mod = new Module();
    sand.stub(mod, 'saveModel').returns(Promise.resolve());

    mod.remove({id: '1'})
    .then(() => {
        t.equal(mod.saveModel.called, true);
        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Module: isEncryptEnabled()', t => {
    const mod = new Module();
    const rad = Radio.channel('collections/Configs');

    let configs = {encryptBackup: {encrypt: 1}};
    rad.reply('findConfigs', () => configs);

    t.equal(mod.isEncryptEnabled({}), false,
        'returns false if a model does not have encryptKeys property');
    t.equal(mod.isEncryptEnabled(), true, 'returns true');

    configs = {encryptBackup: {}, encrypt: 1};
    t.equal(mod.isEncryptEnabled(), true, 'returns true');

    mod.channel.stopReplying();
    sand.restore();
    rad.stopReplying();
    t.end();
});

test('Module: decryptModel()', t => {
    const mod  = new Module();
    const stub = sand.stub();
    sand.stub(mod, 'isEncryptEnabled').returns(false);

    Radio.replyOnce('encrypt', 'decryptModel', data => {
        stub();
        return Promise.resolve(data.model);
    });

    mod.decryptModel({id: '1'})
    .then(model => {
        t.equal(stub.notCalled, true);
        t.deepEqual(model, {id: '1'});

        mod.isEncryptEnabled.returns(true);
        return mod.decryptModel({id: '2'});
    })
    .then(model => {
        t.deepEqual(model, {id: '2'});

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Module: decryptCollection()', t => {
    const mod  = new Module();
    const stub = sand.stub();
    sand.stub(mod, 'isEncryptEnabled').returns(false);

    Radio.replyOnce('encrypt', 'decryptCollection', data => {
        stub();
        return Promise.resolve(data.collection);
    });

    mod.decryptCollection({model: '1'})
    .then(coll => {
        t.deepEqual(coll, {model: '1'});

        mod.collection = {model: '2'};
        mod.isEncryptEnabled.returns(true);
        return mod.decryptCollection();
    })
    .then(coll => {
        t.deepEqual(coll, {model: '2'});

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Module: encryptModel()', t => {
    const mod  = new Module();
    const stub = sand.stub();
    sand.stub(mod, 'isEncryptEnabled').returns(false);

    Radio.replyOnce('encrypt', 'encryptModel', data => {
        stub();
        return Promise.resolve(data.model);
    });

    mod.encryptModel({id: '1'})
    .then(model => {
        t.deepEqual(model, {id: '1'});
        mod.isEncryptEnabled.returns(true);
        return mod.encryptModel({id: '2'});
    })
    .then(model => {
        t.deepEqual(model, {id: '2'});

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});
