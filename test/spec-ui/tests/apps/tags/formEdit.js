'use strict';
/**
 * Edit tag form test
 */
var expect = require('chai').expect,
    ids    = [];

module.exports = {

    before: function(client, done) {
        client.closeWelcome();

        client
        .urlHash('notebooks')
        .expect.element('a[title="New tag"]').to.be.present.before(50000);

        client.addTag({name: 'New tag'});

        // Get all rendered tags
        client.findAll('#tags .list--item', 'data-id', (res) => {
            expect(typeof res).to.be.equal('object');
            expect(res.length).to.be.equal(1);
            ids = res;
            done();
        });
    },

    after: function(client) {
        client.end();
    },

    'shows tag edit form': function(client) {
        client
        .urlHash('notebooks')
        .pause(200)
        .urlHash('tags/edit/' + ids[0])
        .expect.element('.modal-content').to.be.present.before(5000);

        client.expect.element('#modal .form-group').to.be.visible.before(5000);

        client
        .clearValue('#modal input[name="name"]')
        .setValue('#modal input[name="name"]', 'Changed-Title')
        .expect.element('#modal input[name="name"]').to.have.value.that.equals('Changed-Title');
    },

    'list re-renders tags with new values': function(client) {
        client
        .setValue('#modal input[name="name"]', ['Changed-Title', client.Keys.ENTER]);

        client.expect.element('#modal .form-group').not.to.be.present.before(5000);

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
    },

    'shows tag form with updated data': function(client) {
        client
        .urlHash(`tags/edit/${ids[0]}`)
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .expect.element('#modal input[name="name"]').to.have.value.that.contains('Changed-Title');

        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
    },
};
