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
        client.urlHash('settings/importExport');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(50000);
        client.perform(() => {done();})
    });

    after(function(client, done) {
        done();
    });

    it('"Import & Export" tab is active in #/settings/importExports', function(client) {
        client
        .expect.element('.list--settings.active').to.have.text.that.contains('Import & Export');
    });

    // @TODO Test importing & exporting json config files
});
