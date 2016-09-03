'use strict';
var expect = require('chai').expect,
    ids    = [];

/**
 * Edit notebook form test
 */
module.exports = {

    before: function(client) {
        client.closeWelcome();
    },

    after: function(client) {
        client.end();
    },

    'load': function(client) {
        client.addNotebook({name: 'notebook 1', parentId: 0});
        client.addNotebook({name: 'Sub-notebook', parentId: 'notebook 1'});

        client.perform(function(client, done) {
            client
            .urlHash('notebooks');

            // Get all rendered notebooks
            client.findAll('#notebooks .list--item', 'data-id', (res) => {
                expect(typeof res).to.be.equal('object');
                expect(res.length).to.be.equal(2);
                ids = res;
                done();
            });
        });
    },

    'shows notebook edit form': function(client) {
        client
        .urlHash(`notebooks/edit/${ids[0]}`)
        .expect.element('#modal .form-group').to.be.present.before(2000);

        client
        .clearValue('#modal input[name="name"]')
        .pause(200)
        .setValue('#modal input[name="name"]', 'Changed-Title')
        .expect.element('#modal input[name="name"]').to.have.value.that.contains('Changed-Title');
    },

    'list re-renders notebooks with new values': function(client) {
        client
        .setValue('#modal input[name="name"]', [client.Keys.ENTER])
        .pause(500)
        .expect.element('#notebooks').text.to.contain('Changed-Title');

        client.expect.element('#notebooks').text.to.contain('Sub-notebook');
    },

    'shows notebook form with updated data': function(client) {
        client
        .urlHash(`notebooks/edit/${ids[1]}`)
        .expect.element('#modal .form-group').to.be.visible.before(5000);

        client.expect.element('#modal input[name="name"]').value.to.contain('Sub-notebook');
        client.expect.element('#modal select[name="parentId"]').text.to.contain('Changed-Title');
    },

    'shows notebook form with correct notebookId': function(client) {
        client
        .expect.element('#modal select[name="parentId"]').to.have.value.that.equals(ids[0]);
    },

    'can update sub-notebooks': function(client) {
        client
        .clearValue('#modal input[name="name"]')
        .setValue('#modal input[name="name"]', ['Sub-CT', client.Keys.ENTER]);
    },

    're-renders notebooks list with updated data': function(client) {
        client
        .expect.element('#notebooks').text.to.contain('Sub-CT');
        client
        .expect.element('#notebooks').text.to.contain('Changed-Title');
    },

    'doesn\'t update if title is empty': function(client) {
        client
        .urlHash('notebooks')
        .urlHash(`notebooks/edit/${ids[0]}`)
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .clearValue('#modal input[name="name"]')
        .setValue('#modal input[name="name"]', [client.Keys.ENTER]);

        client
        .expect.element('#notebooks').text.to.contain('Changed-Title');
    },

};
