/* global describe, before, after, it */
'use strict';

describe('#/notes/add', function() {
    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        client.end(function() {
            done();
        });
    });

    it('can change note title', function(client) {
        client.urlHash('notes/add')
        .expect.element('#editor--input--title').to.be.visible.before(50000);

        client.setValue('#editor--input--title', ['Nightwatch', client.keys.ENTER])
        .pause(1000)
        .expect.element('#editor--input--title').value.to.contain('Nightwatch');
    });

});
