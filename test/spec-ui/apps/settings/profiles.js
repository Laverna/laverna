/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Notebook list test
 */

describe('#/notebooks', function() {
    var keys;

    before(function(client, done) {
        this.timeout(100000);
        client.urlHash('settings/profiles');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(50000);
        client.perform(() => {done();})
    });

    after(function(client, done) {
        done();
    });

    it('profiles tab is active in #/settings/profiles', function(client) {
        client
        .expect.element('.list--settings.active').to.have.text.that.contains('Profiles');
    });

    it('can add new profiles', function(client) {
        client.setValue('#profileName', ['NightwatchProfile', client.Keys.ENTER]);
        client.assert.value('#profileName', '');
        client.expect.element('.layout--body.-settings').to.have.text.that.contains('NightwatchProfile');
    });

    it('new profiles are saved', function(client) {
        client.click('.settings--save');
        client.click('.settings--cancel');

        client.expect.element('#header--add').to.be.visible.before(50000);
        client.urlHash('settings/profiles');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(5000);
        client.expect.element('.layout--body.-settings').to.have.text.that.contains('NightwatchProfile');
    });

    it('new profiles appear in sidemenu', function(client) {
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client.click('#header--title');
        client.expect.element('.sidemenu.-show').to.be.present.before(5000);
        client.expect.element('.sidemenu.-show').to.be.visible.before(5000);

        client.expect.element('.sidemenu').to.have.text.that.contains('NightwatchProfile');
    });
});
