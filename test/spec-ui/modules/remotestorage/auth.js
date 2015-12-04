/* global it */
'use strict';

/**
 * It tests if it's possible to login to a RemoteStorage server.
 */
it('creates a new user on RemoteStorage server', function(client) {
    client
    .url('http://localhost:9100/signup')
    .expect.element('input[type="password"]').to.be.present.before(50000);

    client
    .setValue('#username', 'test')
    .setValue('#email', 'test@example.com')
    .setValue('#password', ['1', client.Keys.ENTER])
    .pause(300);
});

it('shows RemoteStorage widget', function(client) {
    client
    .urlHash('notes')
    .expect.element('.remotestorage-initial').to.be.present.before(50000);
});

it('can login to a RemoteStorage server', function(client) {
    client
    .click('.rs-bubble')
    .setValue('.remotestorage-initial input[name="userAddress"]', 'test@localhost:9100')
    .click('.remotestorage-initial .connect')
    .expect.element('input[type="password"]').to.be.present.before(10000);

    client.assert.urlContains('localhost:9100');

    client
    .setValue('#password', ['1', client.Keys.ENTER])
    .expect.element('.remotestorage-connected').to.be.present.before(50000);
});
