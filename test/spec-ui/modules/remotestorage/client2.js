/* global describe, before, after, it */
'use strict';

describe('RemoteStorage: client 2', function() {

    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        client.end(function() {
            done();
        });
    });

    it('creates new data', function(client) {
        client
        .addNote({title: 'Note from client 2'})
        .pause(500)
        .addNotebook({name: 'Notebook from client 2'})
        .pause(500)
        .addTag({name: 'Tag from client 2'});
    });

    // Try to login to a RemoteStorage first
    require('./auth.js');

    it('fetches notes from Remotestorage', function(client) {
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.present.before(50000);

        client.expect
        .element('#sidebar--content').to.have.text.that.contains('Note from client 1')
        .before(50000);
    });

    it('fetches notebooks & tags from Remotestorage', function(client) {
        client.urlHash('notebooks');

        client.expect
        .element('#notebooks').text.to.contain('Notebook from client 1')
        .before(50000);

        client.expect
        .element('#tags').text.to.contain('Tag from client 1')
        .that.contains('Tag from client 1')
        .before(50000);
    });

});
