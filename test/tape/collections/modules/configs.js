/**
 * @file Test collections/modules/Configs
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import _ from '../../../../app/scripts/utils/underscore';
import ModuleOrig from '../../../../app/scripts/collections/modules/Module';
import Configs from '../../../../app/scripts/collections/Configs';
import Module from '../../../../app/scripts/collections/modules/Configs';

let sand;
test('collections/modules/Configs: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Configs: Collection', t => {
    t.equal(Module.prototype.Collection, Configs, 'uses configs collection');
    t.end();
});

test('collections/modules/Configs: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWith({
        findConfig          : mod.findConfig,
        findConfigs         : mod.findConfigs,
        saveConfig          : mod.saveConfig,
        saveConfigs         : mod.saveConfigs,
        findProfileModel    : mod.findProfileModel,
        findDefaultProfiles : mod.findDefaultProfiles,
        createProfile       : mod.createProfile,
        removeProfile       : mod.removeProfile,
        changePassphrase    : mod.changePassphrase,
        createDeviceId      : mod.createDeviceId,
        updatePeer          : mod.updatePeer,
    }, mod), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('collections/modules/Configs: findModel()', t => {
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

test('collections/modules/Configs: find()', t => {
    const mod        = new Module();
    const collection = new mod.Collection([{id: '1'}]);
    mod.collection   = collection;

    const find = sand.stub(ModuleOrig.prototype, 'find');
    sand.stub(mod, 'getProfileId').returns(Promise.resolve('default'));
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
        t.equal(find.calledWithMatch({profileId: 'default'}), true,
            'uses profile ID');
        t.equal(mod.checkOrCreate.calledAfter(find), true,
            'will try to create the default configs');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Configs: saveModel()', t => {
    const mod   = new Module();
    const model = new mod.Model({name: '', value: 0});
    const stub  = sand.stub(mod, 'backupEncrypt');
    const save  = sand.stub(ModuleOrig.prototype, 'saveModel').resolves();

    mod.saveModel({model, data: {value: 1}})
    .then(() => {
        t.equal(save.called, true, 'saves the model');
        t.equal(stub.notCalled, true, 'does not call backupEncrypt()');

        model.set('name', 'encrypt');
        return mod.saveModel({model, data: {value: 1}});
    })
    .then(() => {
        t.equal(stub.called, true, 'backs up encryption setting');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Configs: backupEncrypt()', t => {
    const mod      = new Module();
    const model    = new mod.Model({value: 0});
    const backup   = new mod.Model({name: 'encryptBackup', value: 1});
    mod.collection = new Configs([backup]);
    const save     = sand.stub(mod, 'saveModel');

    mod.backupEncrypt({model});
    t.equal(save.notCalled, true, 'does nothing if nothing has changed');

    model.set({name: 'encryption', value: 0});
    mod.backupEncrypt({model});
    t.equal(save.notCalled, true,
        'does nothing if the encryption setting has not changed');

    model.set('value', 1);
    mod.backupEncrypt({model});
    t.equal(save.calledWith({model: backup, data: {value: {encrypt: 0}}}), true,
        'changes the value to "0"');

    model.set('value', 0);
    mod.backupEncrypt({model});
    t.equal(save.calledWith({model: backup, data: {value: {encrypt: 1}}}), true,
        'changes the value to 1');

    sand.restore();
    t.end();
});

test('collections/modules/Configs: getProfileId()', t => {
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
        t.equal(profileId, 'default', 'uses the default database');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Configs: checkOrCreate()', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection();

    const hasNew  = sand.stub(mod.collection, 'hasNewConfigs').returns(false);
    const trigger = sand.stub(mod.channel, 'trigger');
    const create  = sand.stub(mod.collection, 'createDefault')
    .resolves();
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
        t.equal(find.calledWith({profileId: 'default'}), true,
            'fetches configs again');

        mod.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('collections/modules/Configs: findConfig()', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection([{name: 'test', value: 'yes'}]);

    t.equal(mod.findConfig({name: 'test'}), 'yes',
        'returns the value of a config');
    t.equal(mod.findConfig({name: 'helloTest', default: 'no'}), 'no',
        'returns the default');

    mod.channel.stopReplying();
    t.end();
});

test('collections/modules/Configs: findConfigs()', t => {
    const mod      = new Module();
    mod.collection = new mod.Collection([{name: 'test', value: 'yes'}]);
    const spy = sand.spy(mod.collection, 'getConfigs');

    t.deepEqual(mod.findConfigs(), {test: 'yes'}, 'returns a key=>value object');
    t.equal(spy.called, true, 'calls getConfigs method');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('collections/modules/Configs: saveConfig()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel').resolves('saved');
    const find = sand.stub(mod, 'findModel').resolves(null);

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

test('collections/modules/Configs: saveConfigs() - object', t => {
    const mod     = new Module();
    const configs = {
        test  : {name: 'test', value: 'test1'},
        test2 : {name: 'test2', value: 'test2'},
    };
    const save = sand.stub(mod, 'saveConfig');

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

test('collections/modules/Configs: saveConfigs() - array', t => {
    const mod     = new Module();
    const configs = [
        {name: 'test', value: 'test1'},
        {name: 'test2', value: 'test2'},
    ];
    const save = sand.stub(mod, 'saveConfig');

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

test('collections/modules/Configs: findProfileModel()', t => {
    const mod  = new Module();
    const find = sand.stub(mod, 'findModel').returns('yes');

    t.equal(mod.findProfileModel(), 'yes');
    t.equal(find.calledWith({name: 'appProfiles', profileId: 'default'}), true,
        'fetches appProfiles model from the default database');

    mod.channel.stopReplying();
    sand.restore();
    t.end();
});

test('collections/modules/Configs: findDefaultProfiles()', t => {
    const mod = new Module();

    mod.findDefaultProfiles()
    .then(profiles => {
        t.equal(Array.isArray(profiles), true, 'returns an array');
        mod.channel.stopReplying();
        t.end();
    });
});

test('collections/modules/Configs: findProfileUseDefaults()', t => {
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

test('collections/modules/Configs: createProfile()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel');

    mod.createProfile({name: 'default'})
    .then(() => {
        t.equal(save.notCalled, true, 'does nothing if the profile already exists');
        return mod.createProfile({name: 'test'});
    })
    .then(() => {
        t.equal(save.calledWithMatch({data: {value: ['default', 'test']}}), true,
            'adds the profile to the array');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('collections/modules/Configs: removeProfile()', t => {
    const mod  = new Module();
    const save = sand.stub(mod, 'saveModel');
    sand.stub(mod, 'findProfileModel').returns(
        Promise.resolve(new mod.Model({value: ['default', 'test', '1']}))
    );

    mod.removeProfile({name: 'test2'})
    .then(() => {
        t.equal(save.notCalled, true, 'does nothing if the profile does not exist');
        return mod.removeProfile({name: 'test'});
    })
    .then(() => {
        t.equal(save.calledWithMatch({data: {value: ['default', '1']}}), true,
            'removes the profile from the array');

        sand.restore();
        mod.channel.stopReplying();
        t.end();
    });
});

test('collections/modules/Configs: changePassphrase() - reject', t => {
    const mod    = new Module();
    const reject = sand.spy(Promise, 'reject');

    mod.changePassphrase({oldPassphrase: '1', newPassphrase: '1'}).catch(() => {});
    t.equal(reject.called, true,
        'rejects the promise if the old and new passphrase are the same');

    mod.changePassphrase({oldPassphrase: '', newPassphrase: '1'}).catch(() => {});
    t.equal(reject.called, true, 'rejects the promise if the old passphrase is empty');

    mod.changePassphrase({oldPassphrase: '1', newPassphrase: ''}).catch(() => {});
    t.equal(reject.called, true, 'rejects the promise if the new passphrase is empty');

    sand.restore();
    t.end();
});

test('collections/modules/Configs: changePassphrase() - success', t => {
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

test('collections/modules/Configs: createDeviceId()', t => {
    const mod = new Module();
    const req = sand.stub(Radio, 'request').returns(Promise.resolve('rand'));
    sand.stub(mod, 'saveConfig');

    mod.createDeviceId()
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'random', {number: 6}), true,
            'generates random string');

        t.equal(mod.saveConfig.calledWith({
            config: {name: 'deviceId', value: 'rand'},
        }), true, 'saves the device ID');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Configs: updatePeer()', t => {
    const mod      = new Module();
    const lastSeen = Date.now();
    const model    = new Configs.prototype.model({
        value: [{lastSeen, username: 'bob', deviceId: '2'}],
    });
    sand.stub(mod, 'findModel').returns(Promise.resolve(model));
    sand.stub(mod, 'saveModel');

    mod.updatePeer({username: null, deviceId: null});
    t.equal(mod.findModel.notCalled, true,
        'does nothing if username and deviceId are empty');

    const res = mod.updatePeer({username: 'bob', deviceId: '1'});
    t.equal(mod.findModel.calledWith({name: 'peers'}), true,
        'fetches "peers" configs');

    res.then(() => {
        const peer = _.findWhere(model.get('value'), {username: 'bob', deviceId: '1'});
        t.notEqual(peer, undefined, 'adds a new peer');

        return mod.updatePeer({username: 'bob', deviceId: '2'});
    })
    .then(() => {
        const peer = _.findWhere(model.get('value'), {username: 'bob', deviceId: '2'});
        t.notEqual(lastSeen, peer.lastSeen, 'updates "lastSeen" date');

        t.equal(mod.saveModel.calledWithMatch({model}), true, 'saves the changes');

        sand.restore();
        t.end();
    });
});
