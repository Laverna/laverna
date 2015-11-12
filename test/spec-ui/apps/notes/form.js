/* global describe, before, after, it */
'use strict';

describe('Note form', function() {
    var notebookId;

    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        done();
    });

    it('can change note title', function(client) {
        client
        .urlHash('notes')
        .pause(200)
        .urlHash('notes/add')
        .expect.element('#editor--input--title').to.be.visible.before(50000);

        client
        .setValue('#editor--input--title', ['Night'])
        .expect.element('#editor--input--title').value.to.contain('Night').before(1000);
    });

    it('shows confirm dialog if title is not empty', function(client) {
        client
        .setValue('#editor--input--title', [' Watch'])
        .click('.editor--cancel')
        .expect.element('.modal-dialog').to.be.visible.before(1000);
    });

    it('hides confirm dialog on "Esc"', function(client) {
        client
        .keys([client.Keys.ESCAPE])
        .click('.layout--body.-form')
        .waitForElementNotPresent('.modal-dialog', 1000);
    });

    it('closes the form if title is empty', function(client) {
        client
        .clearValue('#editor--input--title')
        .click('.editor--cancel')
        .expect.element('.layout--body.-form').not.to.be.present.before(5000);

        client.expect.element('.list--group').not.to.be.present.after(1000);
    });

    it('shows notebook add form', function(client) {
        client
        .urlHash('notes/add')
        .expect.element('#editor--input--title').to.be.visible.before(50000);

        client.expect.element('.addNotebook').to.be.visible.before(50000);

        client
        .click('.addNotebook')
        .expect.element('.modal--input[name=name]').to.be.present.before(5000);
    });

    it('makes a new notebook active', function(client) {
        client
        .setValue('.modal--input[name=name]', ['Nightwatch', client.Keys.ENTER])
        .pause(1000)
        .perform(function(client, done) {
            client.getValue('[name="notebookId"]', function(res) {
                notebookId = res.value;
                client.assert.containsText('option[value="' + notebookId + '"]', 'Nightwatch');
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

    it('switches into preview mode', function(client) {
        client
        .click('button[title="Mode"]')
        .click('a[data-mode="preview"]')
        .expect.element('body').to.have.attribute('class').which.contains('-preview').before(2000);
    });

    it('switches into normal mode', function(client) {
        client
        .click('button[title="Mode"]')
        .click('a[data-mode="normal"]')
        .expect.element('body').to.have.attribute('class').which.does.not.contain('-preview').before(2000);

        client.expect.element('body').to.have.attribute('class').which.does.not.contain('editor--fullscreen').before(2000);
    });

    it('closes the form', function(client) {
        client
        .click('.editor--cancel')
        .expect.element('.modal-dialog').to.be.visible.before(1000);

        client
        .click('.modal-dialog button[data-event="confirm"]')
        .waitForElementNotPresent('.layout--body.-form', 1000);
    });

    it('makes previously selected notebook active', function(client) {
        client
        .urlHash('notes/f/notebook/q/' + notebookId + '/add')
        .expect.element('#editor--input--title').to.be.visible.before(50000);

        client
        .expect.element('[name="notebookId"]').to.have.attribute('value').which.equals(notebookId);
    });

    it('does not save a note if its title is empty', function(client) {
        client
        .clearValue('#editor--input--title')
        .click('.editor--save')
        .expect.element('.layout--body.-form').to.be.visible.after(1000);
    });

    it('saves a note', function(client) {
        client
        .setValue('#editor--input--title', ['Nightwatch'])
        .expect.element('#editor--input--title').value.to.contain('Nightwatch').before(1000);

        client
        .click('.ace_content')
        .keys(['Nightwatch test content.']);

        client
        .click('.editor--save')
        .expect.element('.layout--body.-form').to.be.not.present.before(5000);
    });

    it('saved the note', function(client) {
        client
        .urlHash('/notes/')
        .expect.element('.list--group').to.be.visible.after(5000);

        client.expect.element('.list').text.to.contain('Nightwatch test content.').before(5000);
        client.expect.element('.list--group').to.be.present.before(5000);
        client.expect.element('.list--item').to.be.present.before(5000);
    });

    it('opens an edit page', function(client) {
        client.getAttribute('.list--item', 'data-id', function(res) {
            client
            .urlHash('/notes/edit/' + res.value)
            .expect.element('.layout--body.-form').to.be.visible.before(1500);
        });
    });

    it('can change a note', function(client) {
        client
        .setValue('#editor--input--title', ['Night Watch'])
        .expect.element('#editor--input--title').value.to.contain('Night Watch').before(1000);

        client
        .click('.ace_content')
        .keys(['Added a new content.']);

        client
        .keys([client.Keys.CONTROL, 's'])
        .expect.element('.layout--body.-form').to.be.not.present.before(5000);
    });

    it('updated the note', function(client) {
        client
        .urlHash('notes')
        .expect.element('.list--group').to.be.visible.after(1000);

        client.expect.element('.list').text.to.contain('Added a new content');
        client.expect.element('.list').text.to.contain('Night Watch');
    });

});
