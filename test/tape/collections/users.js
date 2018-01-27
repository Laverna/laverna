/**
 * @file Test collections/Users
 */
import test from 'tape';
import Users from '../../../app/scripts/collections/Users';
import User from '../../../app/scripts/models/User';

test('collections/Users: sync', t => {
    const coll = new Users();
    t.equal(typeof coll.sync, 'function', 'has sync method');
    t.end();
});

test('collections/Users: profileId', t => {
    t.equal(new Users().profileId, undefined, 'is undefined by default');
    t.equal(new Users(null, {profileId: 'test'}).profileId, 'test');
    t.end();
});

test('collections/Users: model', t => {
    const coll = new Users();
    t.equal(coll.model, User, 'uses "User" model');
    t.end();
});

test('collections/Users: getPending()', t => {
    const coll   = new Users([{pendingAccept: false}, {pendingAccept: true}]);
    const models = coll.getPending();

    t.equal(Array.isArray(models), true, 'returns an array');
    t.equal(models.length, 1, 'returns users who are waiting for your approval');
    t.equal(models[0], coll.findWhere({pendingAccept: true}));

    t.end();
});

test('collections/Users: getTrusted()', t => {
    const coll   = new Users([{pendingAccept: true}, {pendingAccept: false}]);
    const models = coll.getTrusted();

    t.equal(Array.isArray(models), true, 'returns an array');
    t.equal(models.length, 1, 'returns users whom you trust');
    t.equal(models[0], coll.findWhere({pendingAccept: false}));

    t.end();
});

test('collections/Users: getActive()', t => {
    const coll   = new Users([
        {pendingAccept : true, pendingInvite  : false},
        {pendingAccept : false, pendingInvite : true},
        {pendingAccept : false, pendingInvite : false},
    ]);
    const models = coll.getActive();

    t.equal(Array.isArray(models), true, 'returns an array');
    t.equal(models.length, 1, 'returns users whom you trust and who trust you');
    t.equal(models[0], coll.findWhere({
        pendingAccept: false,
        pendingInvite: false,
    }));

    t.end();
});
