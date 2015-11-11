/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

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

    /*
     * @TODO solve this bug
    it('closes the form if title is empty', function(client) {
        client
        .clearValue('#editor--input--title')
        .click('.editor--cancel')
        .waitForElementNotPresent('.layout--body.-form', 1000);
    });
    */

    it('shows notebook add form', function(client) {
        client
        .click('.addNotebook')
        .expect.element('.modal--input[name=name]').to.be.visible.before(1000);
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

    /**
     * @TODO if note's trash status !== 2, it shouldn't be possible to
     * create a note with an empty title.
     */
    it('does not save a note if its title is empty', function(client) {
        client
        .click('.editor--save')
        .expect.element('.layout--body.-form').to.be.visible.after(1000);
    });

    /**
     * @TODO fix a bug which prevents the form from closing.
     */
    it('saves a note', function(client) {
        client
        .setValue('#editor--input--title', ['Nightwatch'])
        .expect.element('#editor--input--title').value.to.contain('Nightwatch').before(1000);

        client
        .click('.ace_content')
        .keys(['Nightwatch test content.']);

        client
        .click('.editor--save')

        // Hack @TODO remove it after fixing the bug with redirects
        .urlHash('notebooks')
        .urlHash('notes')
        .waitForElementNotPresent('.layout--body.-form', 1000);
    });

    /**
     * @TODO this test fails because of autosave...
     */
    it('saved the note', function(client) {
        client
        .urlHash('/notes/')
        .expect.element('.list--group').to.be.visible.after(1000);

        client
        .expect.element('.list').text.to.contain('Nightwatch test content.');

        client.perform(function(client, done) {
            client.execute(
                function() {
                    var $el = document.querySelectorAll('.list--group');
                    return $el.length;
                },
                [],
                function(res) {
                    expect(res.value).to.be.equal(1);
                    done();
                }
            );
        });
    });

    it('opens an edit page', function(client) {
        client.getAttribute('.list--item:first-child', 'data-id', function(res) {
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

        // Hack @TODO remove it after fixing the bug with redirects
        .urlHash('notebooks')
        .waitForElementNotPresent('.layout--body.-form', 2000);
    });

    it('updated the note', function(client) {
        client
        .urlHash('notes')
        .expect.element('.list--group').to.be.visible.after(1000);

        client.expect.element('.list').text.to.contain('Added a new content');
        client.expect.element('.list').text.to.contain('Night Watch');
    });

});
