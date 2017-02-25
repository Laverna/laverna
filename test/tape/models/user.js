/**
 * Test models/User
 * @file
 */
import test from 'tape';
import User from '../../../app/scripts/models/User';

test('models/User: storeName', t => {
    const tag = new User();
    t.equal(tag.storeName, 'users');
    t.end();
});

test('models/User: idAttribute', t => {
    t.equal(User.prototype.idAttribute, 'username');
    t.end();
});

test('models/User: defaults', t => {
    const defaults = new User().defaults;

    t.equal(defaults.type, 'users');
    t.equal(defaults.username, '');
    t.equal(defaults.fingerprint, '');
    t.equal(defaults.publicKey, '');
    t.equal(defaults.pendingAccept, false);
    t.equal(defaults.pendingInvite, false);

    t.end();
});

test('models/User: validateAttributes()', t => {
    const validate = new User().validateAttributes;
    t.equal(Array.isArray(validate), true, 'is an array');
    t.equal(validate.indexOf('username') > -1, true, 'validates username');
    t.equal(validate.indexOf('publicKey') > -1, true, 'validates publicKey');
    t.equal(validate.indexOf('fingerprint') > -1, true, 'validates fingerprint');
    t.end();
});

test('models/User: escapeAttributes()', t => {
    const escape = new User().escapeAttributes;
    t.equal(Array.isArray(escape), true, 'is an array');
    t.equal(escape.indexOf('username') > -1, true, 'validates username');
    t.equal(escape.indexOf('publicKey') > -1, true, 'validates publicKey');
    t.equal(escape.indexOf('fingerprint') > -1, true, 'validates fingerprint');
    t.end();
});
