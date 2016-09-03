'use strict';

/**
 * Tag removal test
 */
module.exports = {

    before: function(client) {
        client.closeWelcome();

        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);
        client.urlHash('notebooks');
    },

    after: function(client) {
        client.end();
    },

    'can remove a tag': function(client) {
        // Prepare a tag to delete
        client.addTag({name: '1.ToRemove'});

        client
        .urlHash('notes')
        .pause(100)
        .urlHash('notebooks');

        client.expect.element('#tags').text.to.contain('1.ToRemove').before(5000);

        // Delete the tag
        client
        .click('#tags .list--buttons .drop-edit')
        .click('#tags .list--buttons .remove-link');

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(5000);
        client.click('#modal .btn[data-event="confirm"]');
        client.pause(500);

        client.expect.element('#tags').text.not.to.contain('1.ToRemove').before(5000);
    },

    'deleted tags don\'t re-appear after url change': function(client) {
        client
        .urlHash('notes')
        .pause(1000)
        .urlHash('notebooks');

        client
        .expect.element('#tags').text.not.to.contain('1.ToRemove')
        .before(5000);
    },
};
