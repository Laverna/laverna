/**
 * @file Test collections/modules/Module
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import ModuleObj from '../../../../app/scripts/collections/modules/Module';
import Notes from '../../../../app/scripts/collections/Notes';
import Edit from '../../../../app/scripts/models/Edit';
import Profile from '../../../../app/scripts/models/Profile';
import _ from '../../../../app/scripts/utils/underscore';

class Module extends ModuleObj {
    get Collection() {
        return Notes;
    }
}

let sand;
test('collections/modules/Module: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Module: Collection', t => {
    t.equal(ModuleObj.prototype.Collection, null, 'is equal to null for default');
    t.equal(Module.prototype.Collection, Notes);
    t.end();
});

test('collections/modules/Module: Model', t => {
    t.equal(Module.prototype.Model, Notes.prototype.model);
    t.end();
});

test('collections/modules/Module: idAttribute', t => {
    t.equal(Module.prototype.idAttribute, Notes.prototype.model.prototype.idAttribute);
    t.end();
});

test('collections/modules/Module: channel', t => {
    t.equal(Module.prototype.channel, Notes.prototype.channel);
    t.equal(typeof Module.prototype.channel, 'object');
    t.end();
});

test('collections/modules/Module: configs', t => {
    const conf = {username: 'bob'};
    const req  = sand.stub(Radio, 'request').returns(conf);

    t.equal(Module.prototype.configs, conf, 'returns the result of the request');
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'makes "findConfigs" request');

    sand.restore();
    t.end();
});

test('collections/modules/Module: user', t => {
    const user = {username: 'alice', privateKey: '--', publicKey: '--pub'};
    const req  = sand.stub(Radio, 'request').returns(user);

    t.equal(Module.prototype.user, user);

    sand.restore();
    t.end();
});

test('collections/modules/Module: constructor()', t => {
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

test('collections/modules/Module: findModel() - no ID', t => {
    const mod = new Module();
    const res = mod.findModel({});

    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(model => {
        t.equal(model.id, undefined);
        mod.channel.stopReplying();
        t.end();
    });
});

test('collections/modules/Module: findModel() - finds a cached model', t => {
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

test('collections/modules/Module: findModel() - fetches a model', t => {
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

test('collections/modules/Module: find()', t => {
    const mod  = new Module();
    const coll = new mod.Collection();
    sand.stub(mod, 'fetch').returns(Promise.resolve(coll));
    sand.stub(coll, 'filterList');
    sand.stub(coll, 'paginate');

    const opt = {
        profileId : 'default',
        conditions: {trash: 0},
    };
    const res = mod.find(opt);
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(mod.fetch.calledWith(_.omit(opt, 'conditions')), true,
        'calls "fetch" method');

    res.then(collection => {
        t.equal(typeof collection, 'object', 'returns an object');
        t.equal(coll.filterList.calledWith(opt), true, 'filters the result');
        t.equal(coll.paginate.called, true, 'paginates the collection');

        return mod.find({});
    })
    .then(() => {
        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Module: fetch()', t => {
    const mod   = new Module();
    const fetch = sand.stub(mod.Collection.prototype, 'fetch');
    fetch.returns(Promise.resolve());
    sand.stub(mod, 'decryptCollection').returns(mod.collection);

    const opt = {profileId: 'test'};
    mod.fetch(opt)
    .then(collection => {
        t.equal(fetch.calledWith(opt), true, 'calls "fetch" method');
        t.equal(mod.decryptCollection.calledWith(mod.collection), true,
            'decrypts the collection');
        t.equal(typeof mod.collection, 'object', 'creates "collection" property');
        t.equal(collection.storeName, mod.collection.storeName);

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('collections/modules/Module: isCollectionCached()', t => {
    const mod      = new Module();
    mod.collection = new Notes([{id: 1}, {id: 2}]);

    t.equal(mod.isCollectionCached({}), true, 'returns true');
    t.equal(mod.isCollectionCached({profileId: 'test'}), false,
        'returns false if profileId in options and in collection are not the same');

    mod.collection.reset([]);
    t.equal(mod.isCollectionCached({}), false,
        'returns false if the collection is empty');

    t.end();
});

test('collections/modules/Module: saveModel()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1', test: '2'});

    sand.stub(mod, 'setSharedBy');
    sand.spy(model, 'setEscape');
    sand.spy(model, 'validate');
    sand.stub(mod, 'encryptModel').returns(Promise.resolve());
    sand.stub(model, 'save');
    sand.stub(mod.channel, 'trigger');
    sand.stub(mod, 'onSaveModel');

    const res = mod.saveModel({model, data: {title: 'Test'}});
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(mod.setSharedBy.calledWith(model), true, 'sets "sharedBy" attribute');

    res.then(() => {
        t.equal(model.validate.calledAfter(model.setEscape), true,
            'validates the model after setting new attributes');

        t.equal(mod.encryptModel.calledWith(model), true,
            'encrypts the model');
        t.equal(model.save.calledWith(model.getData(), {validate: false}), true,
            'saves the model');
        t.equal(mod.channel.trigger.calledWith('save:model', {model}), true,
            'triggers save:model event');
        t.equal(mod.onSaveModel.calledWith(model), true,
            'calls "onSaveModel" method after saving');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Module: setSharedBy()', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1', test: '2'});
    const user  = new Profile({username: 'alice'});

    mod.setSharedBy(model);
    t.equal(model.get('sharedBy'), '',
        'does not set "sharedBy" if user property is undefined');

    Object.defineProperty(mod, 'user', {get: () => user});

    mod.setSharedBy(model);
    t.equal(model.get('sharedBy'), 'alice', 'changes "sharedBy" attribute');

    model.set('sharedBy', 'bob');
    mod.setSharedBy(model);
    t.equal(model.get('sharedBy'), 'bob',
        'does not change sharedBy if it was already set');

    const edit = new Edit();
    t.equal(mod.setSharedBy(edit), false,
        'returns false if the model does not use sharedBy');
    t.equal(edit.get('sharedBy'), undefined, 'does not set "sharedBy"');

    sand.restore();
    t.end();
});

test('collections/modules/Module: onSaveModel()', t => {
    const mod   = new Module();
    const model = new mod.Collection.prototype.model({id: 1});

    t.equal(mod.onSaveModel(model), false, 'returns false if there is no collection');

    mod.collection = new mod.Collection([model]);
    sand.stub(model, 'set');

    mod.onSaveModel(model);
    t.equal(model.set.calledWith(model.attributes), true,
        'updates the model in the collection');

    sand.spy(mod.collection, 'add');
    mod.onSaveModel({id: 2});
    t.equal(mod.collection.add.calledWithMatch({id: 2}), true,
        'adds the model to the collection');

    sand.restore();
    t.end();
});

test('collections/modules/Module: saveModel() - validate', t => {
    const mod   = new Module();
    const model = new mod.Model({id: '1'});
    sand.spy(model, 'trigger');

    const user  = new Profile({username: 'bob'});
    Object.defineProperty(mod, 'user', {get: () => user});

    mod.saveModel({model})
    .catch(err => {
        t.equal(err.search('Validation error') !== -1, true);
        t.equal(model.trigger.calledWith('invalid'), true,
            'triggers "invalid" event');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('collections/modules/Module: save()', t => {
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

test('collections/modules/Module: saveModelObject()', t => {
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

test('collections/modules/Module: saveFromArray()', t => {
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

test('collections/modules/Module: remove() - model', t => {
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

test('collections/modules/Module: remove() - ID', t => {
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

test('collections/modules/Module: isEncryptEnabled()', t => {
    const mod = new Module();
    const req = sand.stub(Radio, 'request');

    req.returns(null);
    t.equal(mod.isEncryptEnabled(), false, 'returns false if configs is equal to null');

    let configs = {encryptBackup: {encrypt: 1}};
    req.withArgs('collections/Configs', 'findConfigs')
    .returns(configs);

    t.equal(mod.isEncryptEnabled({}), false,
        'returns false if a model does not have encryptKeys property');
    t.equal(mod.isEncryptEnabled(), true, 'returns true');

    configs = {encryptBackup: {}, encrypt: 1};
    t.equal(mod.isEncryptEnabled(), true, 'returns true');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('collections/modules/Module: decryptModel()', t => {
    const mod   = new Module();
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve());
    const model = {id: '1'};
    sand.stub(mod, 'isEncryptEnabled').returns(false);

    mod.decryptModel(model);
    t.equal(req.notCalled, true, 'does nothing if encryption is disabled');

    mod.isEncryptEnabled.returns(true);
    mod.decryptModel(model);
    t.equal(req.calledWith('models/Encryption', 'decryptModel', {model}), true,
        'decrypts the model');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('collections/modules/Module: decryptCollection()', t => {
    const mod  = new Module();
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());
    const coll = new Notes();
    sand.stub(mod, 'isEncryptEnabled').returns(false);

    mod.decryptCollection(coll);
    t.equal(req.notCalled, true, 'does nothing if encryption is disabled');

    mod.isEncryptEnabled.returns(true);
    const res = mod.decryptCollection(coll);

    t.equal(req.calledWith('models/Encryption', 'decryptCollection', {
        collection: coll,
    }), true, 'decrypts the collection');

    res.then(res => {
        t.equal(res, coll, 'resolves with the collection the collection');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Module: encryptModel()', t => {
    const mod  = new Module();
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());
    sand.stub(mod, 'isEncryptEnabled').returns(false);
    const model = {id: '1'};

    mod.encryptModel(model);
    t.equal(req.notCalled, true, 'does nothing if encryption is disabled');

    mod.isEncryptEnabled.returns(true);
    mod.encryptModel(model);
    t.equal(req.calledWith('models/Encryption', 'encryptModel', {
        model,
        username: undefined,
    }), true, 'encrypts the model');

    const model2 = new Edit({id: '2', username: 'alice'});
    mod.encryptModel(model2);
    t.equal(req.calledWith('models/Encryption', 'encryptModel', {
        model    : model2,
        username : 'alice',
    }), true, 'encrypts "edit" model with another user\'s public key');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});
