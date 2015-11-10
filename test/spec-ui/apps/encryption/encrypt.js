/* global describe, before, after, it */
'use strict';

describe('/encryption', function() {
    var notes = [];

    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        done();
    });

    it('wait', function(client) {
        client
        .urlHash('notes')
        .expect.element('.list').to.be.present.before(50000);
    });

    it('shows encryption page', function(client) {
        for (var i = 0; i < 8; i++) {
            notes.push({
                title   : 'Encrypted title ' + i,
                content : 'Encrypted content ' + i
            });
            client.addNote(notes[i]);
        }

        client
        .changeEncryption({password: '1', use: true})
        .expect.element('.container.-auth').to.be.present.before(5000);
    });

    it('asks for a new password', function(client) {
        client.expect.element('input[name=password]').to.be.present.before(5000);

        client
        .setValue('input[name=password]', '1')
        .click('.btn-success')
        .expect.element('.container.-auth').not.to.be.present.before(5000);
    });

    it('asks for a new password again after encrypting', function(client) {
        client.expect.element('.container.-auth').to.be.present.before(5000);

        client
        .setValue('input[name="password"]', '1')
        .click('form .btn-success')
        .expect.element('.container.-auth').not.to.be.present.before(5000);
    });

    it('shows notes in unencrypted format', function(client) {
        notes.forEach(function(note) {
            client.expect.element('.list').text.to.contain(note.title).before(5000);
            client.expect.element('.list').text.to.contain(note.content).before(5000);
        });
    });

    it('shows encryption page again if encryption settings are changed', function(client) {
        client
        .pause(1000)
        .changeEncryption({password: '2', use: true})
        .expect.element('.container.-auth').to.be.present.before(5000);
    });

    it('asks the old and new passwords', function(client) {
        client.expect.element('input[name="oldpass"]').to.be.present.before(5000);
        client.expect.element('input[name="password"]').to.be.present.before(5000);
    });

    it('re-encrypts everything', function(client) {
        client
        .setValue('input[name=oldpass]', '1')
        .setValue('input[name=password]', '2')
        .click('form .btn-success')
        .expect.element('.container.-auth').not.to.be.present.before(5000);
    });

    it('asks for a new password again after re-encrypting', function(client) {
        client.expect.element('.container.-auth').to.be.present.before(5000);

        client
        .setValue('input[name="password"]', '2')
        .click('form .btn-success')
        .expect.element('.container.-auth').not.to.be.present.before(5000);
    });

    it('shows notes in unencrypted format', function(client) {
        notes.forEach(function(note) {
            client.expect.element('.list').text.to.contain(note.title).before(5000);
            client.expect.element('.list').text.to.contain(note.content).before(5000);
        });
    });

    it('is possible to disable encryption entirely', function(client) {
        client
        .urlHash('settings/encryption')
        .expect.element('.-tab-encryption').to.be.present.before(5000);

        client
        .click('input[name="encrypt"]')
        .click('.settings--save')
        .pause(1000)
        .click('.settings--cancel')
        .expect.element('.container.-auth').to.be.present.before(5000);

        client
        .setValue('input[name=oldpass]', '2')
        .click('form .btn-success')
        .expect.element('.container.-auth').not.to.be.present.before(5000);

        notes.forEach(function(note) {
            client.expect.element('.list').text.to.contain(note.title).before(5000);
            client.expect.element('.list').text.to.contain(note.content).before(5000);
        });
    });

});
