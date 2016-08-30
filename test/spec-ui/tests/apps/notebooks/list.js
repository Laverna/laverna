'use strict';
var expect = require('chai').expect,
    ids;

/**
 * Notebook list test
 */
module.exports = {

    before: function(client, done) {
        client.closeWelcome();

        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client
        .pause(100)
        .urlHash('notebooks');

        client.addNotebook({name: 'notebook 1', parentId: 0});
        client.addNotebook({name: 'notebook 4', parentId: 0});
        client.addNotebook({name: 'notebook 5', parentId: 'notebook 4'});

        client.findAll('#notebooks .list--item', 'data-id', (res) => {
            ids = res;
            expect(ids.length).to.be.equal(3);
            done();
        });
    },

    after: function(client) {
        client.end();
    },

    'shows notebooks list': function(client) {
        expect(ids.length).not.to.be.equal(0);
        client.expect.element('#header--add').to.be.visible.before(5000);
    },

    'shows a button that shows menu': function(client) {
        client.expect.element('#notebooks .list--buttons .drop-edit').to.be.visible.before(5000);
        client.expect.element('#notebooks .list--buttons .dropdown-menu').to.be.not.visible.before(5000);
    },

    'click on the button shows menu': function(client) {
        client.click('#notebooks .list--buttons .drop-edit');
        client.expect.element('#notebooks .list--buttons .dropdown-menu').to.be.visible.before(5000);
        client.click('#notebooks .list--buttons .drop-edit');
    },

    'edit button shows notebook form': function(client) {
        client
        .click('#notebooks .list--buttons .drop-edit')
        .click('#notebooks .list--buttons .edit-link');

        client.expect.element('#modal .form-group').to.be.present.before(2000);
        client.expect.element('#modal .form-group').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
    },

    'remove button shows dialog': function(client) {
        client
        .click('#notebooks .list--buttons .drop-edit')
        .click('#notebooks .list--buttons .remove-link');

        client.expect.element('#modal .modal-title').to.be.present.before(2000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
        client.click('#notebooks .list--buttons .drop-edit');
    },

    'add button shows notebook form': function(client) {
        client
        .click('#header--add');

        client.expect.element('#modal .modal-title').to.be.present.before(2000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client
        .pause(200)
        .keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
    },

    'navigation keybindings work': function(client) {
        client.getValue('#notebooks .list--item.active', function(value) {
            client.keys('k');
            client.expect.element('#notebooks .list--item.active').value.not.to.be.equal(value).before(5000);
        });

        client.getValue('#notebooks .list--item.active', function(value) {
            client.keys('j');
            client.expect.element('#notebooks .list--item.active').value.not.to.be.equal(value).before(5000);
        });
    },

    // SHIFT+3, c, e and c, SHIFT+3, e
    'shift+3 shows delete form': function(client) {
        client
        .keys([client.Keys.SHIFT, '3'])

        // Hit Shift again to disable it
        .keys(client.Keys.SHIFT);

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(5000);
        client.expect.element('#modal .modal').to.have.css('display').which.equals('block').before(5000);

        client.click('#modal .close');
        client.expect.element('#modal .modal-title').not.to.be.present.before(5000);
    },

    '`c` shows create form': function(client) {
        client.pause(200);

        client.keys('c');

        client.expect.element('#modal .modal-dialog').to.be.present.before(6000);
        client.expect.element('#modal .modal-title').to.be.visible.before(6000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .modal-dialog').not.to.be.present.before(6000);
    },

    '`e` shows edit form': function(client) {
        client.keys('e');

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.click('#modal .cancelBtn');
        client.expect.element('#modal .modal-title').not.to.be.present.before(2000);
    },

    'can navigate to active notes': function(client) {
        client.keys(['g', 'i']);

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('All Notes')
        .before(5000);
    },

    'can navigate to notebooks from notes': function(client) {
        client.keys(['g', 'n']);

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Notebooks & Tags')
        .before(5000);
    },

    'can navigate to favorite notes': function(client) {
        client.keys(['g', 'f']);

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Favorites')
        .before(5000);

        client.keys(['g', 'n']);

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Notebooks & Tags')
        .before(5000);
    },

    'can navigate to removed notes': function(client) {
        client.keys(['g', 't']);

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Trashed')
        .before(5000);

        client.keys(['g', 'n']);

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Notebooks & Tags')
        .before(5000);
    },

    'can filter notes by a notebook name': function(client) {
        client.perform((client, done) => {
            client.getText('#notebooks .list--item.-notebook', (res) => {
                client.click('#notebooks .list--item.-notebook');

                client
                .expect.element('#header--title')
                .to.have.text.that.matches(new RegExp(res.value, 'gi'))
                .before(5000);

                client.keys(['g', 'n']);

                client
                .expect.element('#header--title')
                .to.have.text.that.equals('Notebooks & Tags')
                .before(5000);

                client.perform(done);
            });
        });
    },

    'can filter notes by a notebook name with a keybinding': function(client) {
        client.perform((client, done) => {
            client.getText('#notebooks .list--item.-notebook', (res) => {
                client.keys('j');
                client.expect.element('#notebooks .list--item.active').to.be.present.before(5000);

                client.keys('o');

                client
                .expect.element('#header--title')
                .to.have.text.that.matches(new RegExp(res.value, 'gi'))
                .before(5000);

                client.keys(['g', 'n']);

                client
                .expect.element('#header--title')
                .to.have.text.that.equals('Notebooks & Tags')
                .before(5000);

                client.perform(done);
            });
        });
    },
};
