/**
 * @file Test collections/modules/Users
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';
import * as openpgp from 'openpgp';

import Module from '../../../../app/scripts/collections/modules/Users';
import ModuleOrig from '../../../../app/scripts/collections/modules/Module';
import Users from '../../../../app/scripts/collections/Users';
import User  from '../../../../app/scripts/models/User';

let sand;
test('collections/modules/Users: before()', t => {
    Radio.channel('models/Signal').stopReplying();
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Users: user', t => {
    const attributes = {username: 'alice'};
    const req        = sand.stub(Radio, 'request').returns({attributes});
    t.equal(new Module().user, attributes);
    sand.restore();
    t.end();
});

test('collections/modules/Users: Collection', t => {
    t.equal(Module.prototype.Collection, Users, 'uses "Users" collection');
    t.end();
});

test('collections/modules/Users: constructor()', t => {
    const reply  = sand.stub(Module.prototype.channel, 'reply');
    const mod = new Module();

    t.equal(reply.calledWith({
        acceptInvite    : mod.acceptInvite,
        acceptIfPending : mod.acceptIfPending,
        rejectInvite    : mod.rejectInvite,
        invite          : mod.invite,
        saveInvite      : mod.saveInvite,
    }), true, 'replies to additional requests');

    sand.restore();
    t.end();
});

test('collections/modules/Users: find()', t => {
    const mod      = new Module();
    const find     = sand.stub(ModuleOrig.prototype, 'find').returns(Promise.resolve());
    mod.collection = new Users();

    mod.find();
    t.equal(find.notCalled, true,
        'does not call "find" method if the collection is cached');

    mod.collection = null;
    mod.find();
    t.equal(find.called, true, 'calls "find" method');

    sand.restore();
    t.end();
});

test('collections/modules/Users: saveModel()', t => {
    const mod  = new Module();
    const req  = sand.stub(Radio, 'request');
    const save = sand.stub(ModuleOrig.prototype, 'saveModel').returns(Promise.resolve());

    mod.saveModel({})
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'readUserKey'), false,
            'does not add a users key to the array of public keys');

        req.withArgs('collections/Configs', 'findConfig').returns('---private key---');
        return mod.saveModel({});
    })
    .then(() => {
        t.equal(req.calledWith('models/Encryption', 'readUserKey'), true,
            'adds a users key to the array of public keys');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: remove()', t => {
    const mod      = new Module();
    const model    = new User({username: 'bob'});
    mod.collection = new Users([model]);

    const destroy = sand.stub(User.prototype, 'destroy').returns(Promise.resolve());
    sand.spy(mod.collection, 'remove');

    return mod.remove({model})
    .then(() => {
        t.equal(destroy.called, true, 'destroyes the model');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: acceptInvite()', t => {
    const mod   = new Module();
    const model = new User({username: 'bob', pendingAccept: true, pendingInvite: true});
    const req   = sand.stub(Radio, 'request');
    sand.stub(mod, 'saveModel').returns(Promise.resolve());

    mod.acceptInvite({model})
    .then(() => {
        t.equal(mod.saveModel.calledWith({
            model,
            data: {pendingAccept: false, pendingInvite: false},
        }), true, 'marks the user as trusted');

        t.equal(req.calledWith('models/Peer', 'sendOfferTo', {
            user: model.attributes,
        }), true, 'sends a connection invite to the user');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: acceptIfPending()', t => {
    const mod   = new Module();
    const model = new User({pendingInvite: false});
    const find  = sand.stub(mod, 'findModel').returns(Promise.resolve(model));
    sand.stub(mod, 'acceptInvite');

    mod.acceptIfPending({username: 'bob'})
    .then(() => {
        t.equal(mod.acceptInvite.notCalled, true,
            'does nothing if you did not send an invite to the user');

        model.set('pendingInvite', true);
        return mod.acceptIfPending({username: 'bob'});
    })
    .then(() => {
        t.equal(mod.acceptInvite.calledWith({model}), true,
            'mark the invite as accepted');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: rejectInvite()', t => {
    const mod   = new Module();
    const model = new User({username: 'bob', pendingAccept: true, pendingInvite: true});
    sand.stub(mod, 'remove');
    sand.stub(mod, 'removeServerInvite');

    mod.rejectInvite({model});
    t.equal(mod.removeServerInvite.calledWith(model), true,
        'removes the invite from the server');
    t.equal(mod.remove.calledWith({model}), true, 'removes the user from DB');

    sand.restore();
    t.end();
});

test('collections/modules/Users: removeServerInvite()', t => {
    const mod   = new Module();
    const model = new User({username: 'bob'});
    const req   = sand.stub(Radio, 'request');

    mod.removeServerInvite(model);
    t.equal(req.calledWith('models/Signal', 'removeInvite', {
        username: 'bob',
    }), true, 'sends a message to the signaling server');

    sand.restore();
    t.end();
});

test('collections/modules/Users: addUser()', t => {
    const mod  = new Module();
    const user = {username: 'bob', fingerprint: 'print', publicKey: 'pubKey'};
    sand.stub(mod, 'saveModel');

    mod.addUser({user}, {pendingInvite: true});
    t.equal(mod.saveModel.calledWithMatch({
        data: _.extend(user, {pendingInvite: true}),
    }), true, 'saves the user');

    sand.restore();
    t.end();
});

test('collections/modules/Users: checkKey()', t => {
    const mod  = new Module();
    sand.stub(openpgp.key, 'readArmored').returns({
        keys: [{primaryKey: {fingerprint: 'print'}}],
    });

    t.equal(mod.checkKey('pubKey', 'print'), true,
        'returns true if fingerprints match');
    t.equal(openpgp.key.readArmored.calledWith('pubKey'), true, 'reads the key');

    t.equal(mod.checkKey('pubKey', 'test'), false,
        'returns false if fingerprints do not match');

    sand.restore();
    t.end();
});

test('collections/modules/Users: invite()', t => {
    const mod  = new Module();
    const user = {username: 'bob', fingerprint: 'print', publicKey: 'pubKey'};
    const req  = sand.stub(Radio, 'request');
    sand.stub(mod, 'checkKey').returns(false);
    sand.stub(mod, 'addUser').returns(Promise.resolve());

    mod.invite({user})
    .then(res => {
        t.equal(res, false, 'resolves with false if it is a wrong public key');

        mod.checkKey.returns(true);
        return mod.invite({user});
    })
    .then(res => {
        t.equal(res, true, 'resolves with "true"');
        t.equal(mod.addUser.calledWith({user}, {pendingInvite: true}), true,
            'adds the user to the DB');
        t.equal(req.calledWith('models/Signal', 'sendInvite', user), true,
            'sends the invite to the user');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: saveInvite() -> autoAcceptInvite()', t => {
    const mod     = new Module();
    const options = {username: 'bob', fingerprint: 'test', publicKey: 'pubKey'};
    const model   = new User({username: 'bob', pendingAccept: true});

    sand.stub(openpgp.key, 'readArmored').returns({
        keys: [{primaryKey: {fingerprint: 'print'}}],
    });
    sand.stub(mod, 'findModel').returns(Promise.resolve(model));
    sand.stub(mod, 'autoAcceptInvite');
    sand.stub(mod, 'removeServerInvite');

    mod.saveInvite(options)
    .then(res => {
        t.equal(res, false, 'resolves with "false" if it is a wrong public key');

        options.fingerprint = 'print';
        return mod.saveInvite(options);
    })
    .then(res => {
        t.equal(res, true, 'resolves with "true"');
        t.equal(mod.findModel.calledWith({username: 'bob'}), true,
            'tries to find the user in the database');
        t.equal(mod.autoAcceptInvite.calledWith(options), true,
            'automatically accepts the invite if the user exists in the DB');

        model.set('pendingAccept', false);
        mod.saveInvite(options)
    })
    .then(() => {
        t.equal(mod.removeServerInvite.calledWith(model), true,
            'removes the invite from the server if the it was already accepted');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: saveInvite() -> saveNewInvite()', t => {
    const mod     = new Module();
    const options = {username: 'bob', fingerprint: 'print', publicKey: 'pubKey'};

    sand.stub(openpgp.key, 'readArmored').returns({
        keys: [{primaryKey: {fingerprint: 'print'}}],
    });
    sand.stub(mod, 'findModel').returns(Promise.reject('error'));
    sand.stub(mod, 'saveNewInvite');

    mod.saveInvite(options)
    .catch(() => {
        t.pass('throws an error');

        mod.findModel.returns(Promise.reject('not found'));
        return mod.saveInvite(options);
    })
    .then(res => {
        t.equal(res, true, 'resolves with "true"');
        t.equal(mod.saveNewInvite.calledWith(options), true, 'saves a new user');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: autoAcceptInvite()', t => {
    const mod     = new Module();
    const options = {username: 'bob', fingerprint: 'print', publicKey: 'pubKey'};
    const model   = new User({username: 'bob', pendingInvite: true});

    sand.stub(mod, 'acceptInvite');
    sand.stub(mod, 'checkInviteSignature').returns(Promise.resolve(false));

    mod.autoAcceptInvite(options, ['pubKey'], model)
    .then(() => {
        t.equal(mod.checkInviteSignature.calledWith(options, ['pubKey']), true,
            'checks the invite signature');
        t.equal(mod.acceptInvite.notCalled, true,
            'does not accept the invite if the signature is incorrect');

        mod.checkInviteSignature.returns(Promise.resolve(true));
        return mod.autoAcceptInvite(options, ['pubKey'], model);
    })
    .then(() => {
        t.equal(mod.acceptInvite.notCalled, true,
            'does not accept the invite if fingerprints are different');

        model.set('fingerprint', 'print');
        return mod.autoAcceptInvite(options, ['pubKey'], model);
    })
    .then(() => {
        t.equal(mod.acceptInvite.calledWith({model}), true, 'accepts the invite');
        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: saveNewInvite()', t => {
    const mod     = new Module();
    const options = {username: 'bob', fingerprint: 'print', publicKey: 'pubKey'};
    sand.stub(mod, 'checkInviteSignature').returns(Promise.resolve(false));
    sand.stub(mod, 'addUser').returns(Promise.resolve());

    mod.saveNewInvite(options, ['pubKey'])
    .then(res => {
        t.equal(mod.checkInviteSignature.calledWith(options, ['pubKey']), true,
            'checks the invite signature');
        t.equal(res, false, 'resolves with "false" if the signature is incorrect');

        mod.checkInviteSignature.returns(Promise.resolve(true));
        return mod.saveNewInvite(options, ['pubKey']);
    })
    .then(res => {
        t.equal(res, true, 'resolves with "true"');
        t.equal(mod.addUser.calledWith({user: options}, {pendingAccept: true}),
            true, 'adds a new user');

        sand.restore();
        t.end();
    });
});

test('collections/modules/Users: checkInviteSignature()', t => {
    const mod       = new Module();
    const options   = {username: 'bob', fingerprint: 'print', publicKey: 'pubKey'};
    const data      = JSON.stringify({from: options.username, to: 'alice'});
    const signature = {valid: true};
    sand.stub(Radio, 'request').returns(Promise.resolve({
        data,
        signatures: [signature],
    }));
    Object.defineProperty(mod, 'user', {get: () => {
        return {username: 'alice'};
    }});

    mod.checkInviteSignature(options, ['pubKey'])
    .then(res => {
        t.equal(res, true, 'returns "true"');

        signature.valid = false;
        return mod.checkInviteSignature(options, ['pubKey']);
    })
    .then(res => {
        t.equal(res, false, 'returns "false" if the signature is invalid');

        sand.restore();
        t.end();
    });
});
