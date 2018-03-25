/**
 * Test models/Profile
 * @file
 */
import test from 'tape';
import Profile from '../../../app/scripts/models/Profile';

test('models/Profile: storeName', t => {
    t.equal(new Profile().storeName, 'profiles');
    t.end();
});

test('models/Profile: idAttribute', t => {
    t.equal(new Profile().idAttribute, 'username');
    t.end();
});

test('models/Profile: defaults', t => {
    const def = new Profile().defaults;
    t.equal(def.username, '');
    t.equal(def.privateKey, '');
    t.equal(def.publicKey, '');

    t.end();
});

test('models/Profile: validateAttributes', t => {
    t.deepEqual(new Profile().validateAttributes, ['username']);
    t.end();
});

test('models/Profile: constructor()', t => {
    const prof = new Profile();
    t.equal(prof.profileId, 'default', 'profileId is always equal to "default"');
    t.end();
});
