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

        client.setValue('#editor--input--title', ['Night', client.keys.ENTER])
        .pause(1000)
        .expect.element('#editor--input--title').value.to.contain('Night');
    });

    it('shows confirm dialog if title is not empty', function(client) {
        client
        .setValue('#editor--input--title', [' Watch', client.keys.ENTER])
        .click('.editor--cancel')
        .expect.element('.modal-dialog').to.be.visible.before(1000);
    });

    it('hides confirm dialog on "Esc"', function(client) {
        client
        .keys([client.Keys.ESCAPE])
        .waitForElementNotPresent('.modal-dialog', 1000);
    });

    it('closes the form if title is empty', function(client) {
        client
        .clearValue('#editor--input--title')
        .click('.editor--cancel')
        .waitForElementNotPresent('.layout--body.-form', 1000);
    });

    it('shows notebook add form', function(client) {
        client
        .click('.addNotebook')
        .expect.element('.modal--input[name=name]').to.be.visible.before(1000);
    });

    it('makes a new notebook active', function(client) {
        client
        .setValue('.modal--input[name=name]', ['Nightwatch', client.keys.ENTER])
        .keys([client.Keys.ENTER])
        .pause(1000)
        .perform(function(client, done) {
            client.getValue('[name="notebookId"]', function(res) {
                client.assert.containsText('option[value="' + res.value + '"]', 'Nightwatch');
                done();
            });
        });
    });

    it('switches into fullscreen mode', function(client) {
        client.expect.element('a[data-mode="fullscreen"]').to.be.present.before(1000);

        client
        .click('button[title="Mode"]')
        .click('a[data-mode="fullscreen"]')
        .expect.element('body').to.have.attribute('class').which.does.not.contain('-preview').before(2000);

        client.expect.element('body').to.have.attribute('class').which.contains('editor--fullscreen').before(2000);
    });

});
