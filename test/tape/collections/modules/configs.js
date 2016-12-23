/**
 * @file Test collections/modules/Configs
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';

import '../../../../app/scripts/utils/underscore';
import ModuleOrig from '../../../../app/scripts/collections/modules/Module';
import Configs from '../../../../app/scripts/collections/Configs';
import Module from '../../../../app/scripts/collections/modules/Configs';

let sand;
test('Configs: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Configs: Collection', t => {
    t.equal(Module.prototype.Collection, Configs, 'uses configs collection');
    t.end();
});

test('Configs: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWithMatch({
        findConfig          : mod.findConfig,
        findConfigs         : mod.findConfigs,
        saveConfig          : mod.saveConfig,
        saveConfigs         : mod.saveConfigs,
        findProfileModel    : mod.findProfileModel,
        findDefaultProfiles : mod.findDefaultProfiles,
        createProfile       : mod.createProfile,
        removeProfile       : mod.removeProfile,
        changePassphrase    : mod.changePassphrase,
        addPublicKey        : mod.addPublicKey,
        removePublicKey     : mod.removePublicKey,
    }, mod), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('Configs: findModel()', t => {
    const mod  = new Module();
    const find = sand.stub(ModuleOrig.prototype, 'findModel');
    const get  = sand.spy(Configs.prototype, 'getDefault');
    find.returns(Promise.resolve(new mod.Model()));

    const opt = {name: 'test', profileId: 'test'};
    mod.findModel(opt)
    .then(() => {
        t.equal(find.calledWith(opt), true, 'calls parent method');
        t.equal(get.notCalled, true, 'does not call getDefault method');

        find.returns(Promise.reject('not found'));
        return mod.findModel(opt);
    })
    .then(() => {
        t.equal(get.calledWith('test'), true, 'returns the default values');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: find()', t => {
    const mod        = new Module();
    const collection = new mod.Collection([{id: '1'}]);
    mod.collection   = collection;

    const find = sand.stub(ModuleOrig.prototype, 'find');
    sand.stub(mod, 'getProfileId').returns(Promise.resolve('notes-db'));
    sand.stub(mod, 'checkOrCreate');

    mod.find({profileId: 'test'})
    .then(coll => {
        t.equal(coll, collection, 'returns the existing collection');
        t.equal(mod.getProfileId.notCalled, true,
            'does nothing if there is a collection');

        mod.collection.reset([]);
        return mod.find({profileId: 'test'});
    })
    .then(() => {
        t.equal(mod.getProfileId.called, true,
            'find out what profileId this profile uses to store configs');
        t.equal(find.calledAfter(mod.getProfileId), true,
            'calls the parent method after finding out the profile ID');
        t.equal(find.calledWithMatch({profileId: 'notes-db'}), true,
            'uses profile ID');
        t.equal(mod.checkOrCreate.calledAfter(find), true,
            'will try to create the default configs');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: getProfileId()', t => {
    const mod   = new Module();
    const model = new mod.Model({value: 0});
    const find  = sand.stub(mod, 'findModel').returns(Promise.resolve(model));

    mod.getProfileId({profileId: 'test'})
    .then(profileId => {
        t.equal(find.calledWith({profileId: 'test', name: 'useDefaultConfigs'}), true,
            'tries to find useDefaultConfigs model');
        t.equal(profileId, 'test', 'does not use the default database');

        model.set('value', 1);
        return mod.getProfileId({profileId: 'test'});
    })
    .then(profileId => {
        t.equal(profileId, 'notes-db', 'uses the default database');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: checkOrCreate()', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection();

    const hasNew  = sand.stub(mod.collection, 'hasNewConfigs').returns(false);
    const trigger = sand.stub(mod.channel, 'trigger');
    const create  = sand.stub(mod.collection, 'createDefault')
        .returns(Promise.resolve());
    const find = sand.stub(ModuleOrig.prototype, 'find');

    mod.checkOrCreate()
    .then(coll => {
        t.equal(coll, mod.collection, 'returns the current collection');

        hasNew.returns(true);
        return mod.checkOrCreate();
    })
    .then(() => {
        t.equal(trigger.calledWith('collection:empty'), true,
            'triggers collection:empty event');
        t.equal(create.called, true, 'creates default configs');
        t.equal(find.calledWith({profileId: 'notes-db'}), true,
            'fetches configs again');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: findConfig()', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection([{name: 'test', value: 'yes'}]);

    t.equal(mod.findConfig({name: 'test'}), 'yes',
        'returns the value of a config');
    t.equal(mod.findConfig({name: 'helloTest', default: 'no'}), 'no',
        'returns the default');

    mod.channel.stopReplying();
    t.end();
});

test('Configs: findConfigs()', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection([{name: 'test', value: 'yes'}]);
    const spy = sand.spy(mod.collection, 'getConfigs');

    t.deepEqual(mod.findConfigs(), {test: 'yes'}, 'returns a key=>value object');
    t.equal(spy.called, true, 'calls getConfigs method');

    sand.restore();
    t.end();
});

test('Configs: saveConfig()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel').returns(Promise.resolve('saved'));
    const find = sand.stub(mod, 'findModel').returns(Promise.resolve(null));

    const useDefault = new mod.Model();
    const config     = {name: 'useDefaultConfigs', value: '1'};

    mod.saveConfig({config, useDefault})
    .then(() => {
        t.equal(find.notCalled, true, 'does not try to find the model');
        t.equal(save.calledWith({model: useDefault, data: config}), true,
            'saves useDefaultConfigs model');

        config.name = 'test';
        return mod.saveConfig({config, useDefault, profileId: 'test'});
    })
    .then(res => {
        t.equal(find.calledWithMatch({profileId: 'test', name: 'test'}), true,
            'tries to find the config model');
        t.equal(res, undefined, 'does not save if the model was not found');

        find.returns(Promise.resolve({id: 'yes'}));
        return mod.saveConfig({config, useDefault, profileId: 'test'});
    })
    .then(res => {
        t.equal(res, 'saved', 'saves the config');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: saveConfigs() - object', t => {
    const mod     = new Module();
    const configs = {
        test: {name: 'test', value: 'test1'},
        test2: {name: 'test2', value: 'test2'},
    };
    const save = sand.spy(mod, 'saveConfig');

    mod.saveConfigs({configs, useDefault: 'test', profileId: 'test'})
    .then(() => {
        t.equal(save.callCount, 2, 'saves all configs');

        const opt1 = {config: configs.test, useDefault: 'test', profileId: 'test'};
        t.equal(save.calledWithMatch(opt1), true, 'saves the first config');

        const opt2 = {config: configs.test2, useDefault: 'test', profileId: 'test'};
        t.equal(save.calledWithMatch(opt2), true, 'saves the second config');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: saveConfigs() - array', t => {
    const mod     = new Module();
    const configs = [
        {name: 'test', value: 'test1'},
        {name: 'test2', value: 'test2'},
    ];
    const save = sand.spy(mod, 'saveConfig');

    mod.saveConfigs({configs, useDefault: 'test', profileId: 'test'})
    .then(() => {
        t.equal(save.callCount, 2, 'saves all configs');
        const opt1 = {config: configs[0], useDefault: 'test', profileId: 'test'};
        t.equal(save.calledWithMatch(opt1), true, 'saves the first config');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Configs: findProfileModel()', t => {
    const mod  = new Module();
    const find = sand.stub(mod, 'findModel').returns('yes');

    t.equal(mod.findProfileModel(), 'yes');
    t.equal(find.calledWith({name: 'appProfiles', profileId: 'notes-db'}), true,
        'fetches appProfiles model from the default database');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('Configs: findDefaultProfiles()', t => {
    const mod = new Module();

    mod.findDefaultProfiles()
    .then(profiles => {
        t.equal(Array.isArray(profiles), true, 'returns an array');
        mod.channel.stopReplying();
        t.end();
    });
});

test('Configs: findProfileUseDefaults()', t => {
    const mod = new Module();
    const spy = sand.spy(mod, 'findModel');

    mod.findProfileUseDefaults(['test1', 'test2'])
    .then(res => {
        t.equal(spy.calledWith({profileId: 'test1', name: 'useDefaultConfigs'}), true,
            'fetches useDefaultConfigs from the first profile');
        t.equal(spy.calledWith({profileId: 'test2', name: 'useDefaultConfigs'}), true,
            'fetches useDefaultConfigs from the second profile');

        t.equal(Array.isArray(res), true, 'returns an array');
        t.equal(typeof res[0].get, 'function', 'the array consists of models');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Configs: createProfile()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel');

    mod.createProfile({name: 'notes-db'})
    .then(() => {
        t.equal(save.notCalled, true, 'does nothing if the profile already exists');
        return mod.createProfile({name: 'test'});
    })
    .then(() => {
        t.equal(save.calledWithMatch({data: {value: ['notes-db', 'test']}}), true,
            'adds the profile to the array');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Configs: removeProfile()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel');
    sand.stub(mod, 'findProfileModel').returns(
        Promise.resolve(new mod.Model({value: ['notes-db', 'test', '1']}))
    );

    mod.removeProfile({name: 'test2'})
    .then(() => {
        t.equal(save.notCalled, true, 'does nothing if the profile does not exist');
        return mod.removeProfile({name: 'test'});
    })
    .then(() => {
        t.equal(save.calledWithMatch({data: {value: ['notes-db', '1']}}), true,
            'removes the profile from the array');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Configs: changePassphrase() - reject', t => {
    const mod    = new Module();
    const reject = sand.spy(Promise, 'reject');

    mod.changePassphrase({oldPassphrase: '1', newPassphrase: '1'}).catch(() => {})
    t.equal(reject.called, true,
        'rejects the promise if the old and new passphrase are the same');

    mod.changePassphrase({oldPassphrase: '', newPassphrase: '1'}).catch(() => {});
    t.equal(reject.called, true, 'rejects the promise if the old passphrase is empty');

    mod.changePassphrase({oldPassphrase: '1', newPassphrase: ''}).catch(() => {});
    t.equal(reject.called, true, 'rejects the promise if the new passphrase is empty');

    sand.restore();
    t.end();
});

test('Configs: changePassphrase() - success', t => {
    const mod = new Module();
    const opt = {
        model: new Configs.prototype.model({id: '1'}),
        oldPassphrase: '1',
        newPassphrase: '2',
    };

    const req = sand.stub(Radio, 'request').returns(Promise.resolve('newKey'));
    sand.stub(mod, 'saveModel');

    mod.changePassphrase(opt)
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'changePassphrase', opt),
            true, 'changes the passphrase');
        t.equal(mod.saveModel.calledWith({
            model : opt.model,
            data  : {value: 'newKey'},
        }), true, 'saves the new private key');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('Configs: addPublicKey() - reject', t => {
    const mod    = new Module();
    const reject = sand.spy(Promise, 'reject');
    const read   = sand.stub(openpgp.key, 'readArmored')
    .returns({err: [{message: 'test error'}]});
    const model  = new Configs.prototype.model({value: {test: 'pub'}});

    mod.addPublicKey({model, publicKey: 'pub'}).catch(() => {});
    t.equal(reject.calledWith('test error'), true,
        'rejects the promise if the public key is unreadable');

    read.returns({keys: [{primaryKey: {fingerprint: 'test'}}]});
    mod.addPublicKey({model, publicKey: 'pub'}).catch(() => {});
    t.equal(reject.calledWith('The key already exists!'), true,
        'rejects the promise if the public key already exists');

    sand.restore();
    t.end();
});

test('Configs: addPublicKey() - success', t => {
    const mod   = new Module();
    const model = new Configs.prototype.model({value: {}});
    const read  = sand.stub(openpgp.key, 'readArmored')
    .returns({keys: [{primaryKey: {fingerprint: 'test'}}]});
    sand.stub(mod, 'saveModel').returns(Promise.resolve());
    mod.collection = {trigger: sand.stub()};

    mod.addPublicKey({model, publicKey: 'pub'})
    .then(() => {
        t.equal(mod.saveModel.calledWithMatch({
            model,
            data: {value: {test: 'pub'}},
        }), true, 'saves the public key');

        t.equal(mod.collection.trigger.calledWith('change'), true,
            'triggers "change" event on the collection');

        sand.restore();
        t.end();
    });
});

test('Configs: removePublicKey()', t => {
    const mod   = new Module();
    const read  = sand.stub(openpgp.key, 'readArmored')
    .returns({err: [{message: 'test error'}]});
    const opt   = {publicKey: 'pub', model: new Configs.prototype.model()};
    opt.model.set({value: {test: 'pub', second: 'pub'}});
    sand.spy(Promise, 'reject');

    mod.removePublicKey(opt).catch(() => {});
    t.equal(Promise.reject.calledWith('test error'), true,
        'rejects the promise if the public key is unreadable');

    sand.stub(mod, 'saveModel');
    read.returns({keys: [{primaryKey: {fingerprint: 'test'}}]});

    mod.removePublicKey(opt);
    t.equal(mod.saveModel.calledWith({
        model: opt.model,
        data : {value: {second: 'pub'}},
    }), true, 'removes the public key from database');

    sand.restore();
    t.end();
});
