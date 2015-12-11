'use strict';
var expect = require('chai').expect;

/**
 * Add tags form test
 */
module.exports = {
    before: function(client) {
        client.closeWelcome();
    },

    after: function(client) {
        client.end();
    },

    /**
     * Saves a tag
     */
    'can show tag form when button is clicked': function(client) {
        client
        .urlHash('notebooks')
        .expect.element('a[title="New tag"]').to.be.present.before(50000);

        client.click('a[title="New tag"]')
        .expect.element('#modal .form-group').to.be.visible.before(5000);
    },

    'can change title of a tag': function(client) {
        client.setValue('#modal input[name="name"]', ['Nightwatch'])
        .expect.element('#modal input[name="name"]').value.to.contain('Nightwatch');
    },

    'can save tags': function(client) {
        client
        .expect.element('#modal .ok').text.to.contain('Save');

        client
        .click('#modal .ok')
        .expect.element('#modal .form-group').not.to.be.present.before(5000);
    },

    'saved tags appear in list': function(client) {
        client
        .expect.element('#tags .list--item.-tag').text.to.contain('Nightwatch').before(5000);
    },

    'redirects to tags list on save': function(client) {
        client
        .pause(500)
        .url(function(data) {
            expect(data.value).to.contain('#notebooks');
            expect(data.value).not.to.contain('#tags/add');
        });
    },

    'doesn\'t save if title is empty': function(client) {
        client
        .urlHash('notebooks')
        .urlHash('tags/add')
        .expect.element('#modal .form-group').to.be.visible.before(5000);

        client
        .clearValue('#modal input[name="name"]')
        .click('#modal .ok');

        client.expect.element('.modal-dialog .has-error').to.be.present.before(5000);
        client.keys(client.Keys.ESCAPE);

        client.expect.element('#tags .list--item').text.to.contain('Nightwatch');
    },

    'closes modal window on escape': function(client) {
        client
        .urlHash('notebooks')
        .urlHash('tags/add')
        .expect.element('#modal .form-group').to.be.visible.before(5000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save', client.Keys.ESCAPE])
        .expect.element('#tags').text.not.to.contain('Doesn\'t save').before(5000);
    },

    'closes modal window on cancel button click': function(client) {
        client
        .urlHash('notebooks')
        .urlHash('tags/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save'])
        .click('#modal .cancelBtn')
        .expect.element('#tags').text.not.to.contain('Doesn\'t save').before(2000);
    },
};
