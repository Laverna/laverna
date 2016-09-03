'use strict';
var expect = require('chai').expect,
    notebookCount;

/**
 * Notebook removal test
 */
module.exports = {

    before: function(client, done) {
        client.closeWelcome();

        client.urlHash('notes')
        .expect.element('#header--add').to.be.visible.before(50000);

        client.urlHash('notebooks');

        client.expect.element('#header--add').to.be.visible.before(5000);
        client.elements('css selector', '#notebooks .list--item', (res) => {
            notebookCount = res.value.length;
            done();
        });
    },

    after: function(client) {
        client.end();
    },

    'can remove a notebook': function(client) {
        // Prepare a notebook to delete
        client.addNotebook({name: '1.ToRemove', parentId: 0});

        client
        .urlHash('notes')
        .pause(100)
        .urlHash('notebooks');

        client.expect.element('#notebooks').text.to.contain('1.ToRemove').before(5000);

        // Delete notebook
        client
        .click('#notebooks .list--buttons .drop-edit')
        .click('#notebooks .list--buttons .remove-link');

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(5000);
        client.click('#modal .btn[data-event="confirm"]');
        client.pause(500);

        client.expect.element('#notebooks').text.not.to.contain('1.ToRemove').before(5000);
    },

    'deleted notebooks don\'t re-appear after url change': function(client) {
        client
        .urlHash('notes')
        .pause(1000)
        .urlHash('notebooks');

        client.expect.element('#notebooks').text.not.to.contain('1.ToRemove').before(5000);
    },

    'nested notebooks are not removed, but their parentId is changed': function(client) {
        // Prepare notebooks
        client.addNotebook({name: '1.ToRemove', parentId: 0});
        client.addNotebook({name: '1.NestedRemove', parentId: '1.ToRemove'});
        client.addNotebook({name: '1.RemoveNested', parentId: '1.ToRemove'});

        client
        .urlHash('notes')
        .pause(100)
        .urlHash('notebooks');

        client.expect.element('#notebooks').text.to.contain('1.ToRemove').before(5000);

        // Delete a notebook
        client
        .click('#notebooks .list--buttons .drop-edit')
        .click('#notebooks .list--buttons .remove-link');

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(5000);
        client.click('#modal .btn[data-event="confirm"]');
        client.pause(500);

        client.expect.element('#notebooks').text.not.to.contain('1.ToRemove').before(5000);
        client.expect.element('#notebooks').text.to.contain('1.NestedRemove').before(5000);
        client.expect.element('#notebooks').text.to.contain('1.RemoveNested').before(5000);
    },

    'cleanup': function(client) {
        client
        .urlHash('notes')
        .pause(100)
        .urlHash('notebooks');

        for (var i = 0, len = 2; i <= len; i++) {
            if (i === 2) {
                return;
            }

            client
            .keys('j')
            .pause(100)
            .keys([client.Keys.SHIFT, '3', client.Keys.SHIFT]);

            client.expect.element('#modal .modal-title').to.be.present.before(5000);
            client.expect.element('#modal .modal-title').to.be.visible.before(5000);

            client.click('#modal .btn[data-event="confirm"]');
            client.pause(500);
        }
    },

    'shows notebooks in the navbar menu': function(client) {
        client
        .urlHash('notes')
        .pause(100)
        .urlHash('notebooks');

        client.perform((client, done) => {
            client.elements('css selector', '#notebooks .list--item', (res) => {
                expect(notebookCount).to.be.equal(res.value.length);
                done();
            });
        });
    },

    // @TODO add tests for notes behaviour after linked notebooks are deleted
};
