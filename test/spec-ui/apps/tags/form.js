/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Add tags form test
 */
describe('#/tags/add', function() {
    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        done();
    });

    /**
     * Saves a tag
     */
    it('can show tag form when button is clicked', function(client) {
        client
        .urlHash('notebooks')
        .expect.element('a[title="New tag"]').to.be.present.before(50000);

        client.click('a[title="New tag"]')
        .expect.element('#modal .form-group').to.be.visible.before(5000);
    });

    it('can change title of a tag', function(client) {
        client.setValue('#modal input[name="name"]', ['Nightwatch'])
        .expect.element('#modal input[name="name"]').value.to.contain('Nightwatch');
    });

    it('can save tags', function(client) {
        client
        .expect.element('#modal .ok').text.to.contain('Save');

        client
        .click('#modal .ok')
        .expect.element('#modal .form-group').not.to.be.present.before(5000);
    });

    it('saved tags appear in list', function(client) {
        client
        .expect.element('#tags .list--item.-tag').text.to.contain('Nightwatch').before(5000);
    });

    it('redirects to tags list on save', function(client) {
        client
        .pause(500)
        .url(function(data) {
            expect(data.value).to.contain('#notebooks');
            expect(data.value).not.to.contain('#tags/add');
        });
    });

    it('doesn\'t save if title is empty', function(client) {
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
    });

    it('closes modal window on escape', function(client) {
        client
        .urlHash('notebooks')
        .urlHash('tags/add')
        .expect.element('#modal .form-group').to.be.visible.before(5000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save', client.Keys.ESCAPE])
        .expect.element('#tags').text.not.to.contain('Doesn\'t save').before(5000);
    });

    it('closes modal window on cancel button click', function(client) {
        client
        .urlHash('notebooks')
        .urlHash('tags/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save'])
        .click('#modal .cancelBtn')
        .expect.element('#tags').text.not.to.contain('Doesn\'t save').before(2000);
    });
});

/**
 * Edit tag form test
 */
describe('#/tags/edit', function() {
    var ids = [];

    before(function(client, done) {
        client
        .urlHash('notebooks')
        .expect.element('a[title="New tag"]').to.be.present.before(50000);

        // Get all rendered tags
        client.findAll('#tags .list--item', 'data-id', (res) => {
            expect(typeof res).to.be.equal('object');
            expect(res.length).to.be.equal(1);
            ids = res;
            done();
        });
    });

    after(function(client, done) {
        done();
    });

    it('shows tag edit form', function(client) {
        client
        .urlHash(`tags/edit/${ids[0]}`)
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .clearValue('#modal input[name="name"]')
        .setValue('#modal input[name="name"]', 'Changed-Title')
        .expect.element('#modal input[name="name"]').to.have.value.that.equals('Changed-Title');
    });

    it('list re-renders tags with new values', function(client) {
        client
        .setValue('#modal input[name="name"]', [client.Keys.ENTER])
        .expect.element('#modal .form-group').not.to.be.present.before(5000);

        client.expect.element('#tags').text.to.contain('Changed-Title');

        client.perform((client, done) => {
            // Get all rendered tags
            client.findAll('#tags .list--item', 'data-id', (res) => {
                expect(typeof res).to.be.equal('object');
                expect(res.length).to.be.equal(1);
                ids = res;
                done();
            });
        });
    });

    it('shows tag form with updated data', function(client) {
        client
        .urlHash(`tags/edit/${ids[0]}`)
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .expect.element('#modal input[name="name"]').to.have.value.that.contains('Changed-Title');

        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
    });
});
