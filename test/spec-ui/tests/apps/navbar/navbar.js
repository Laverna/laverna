'use strict';

/**
 * Add notebook form test
//  |)}>#
module.exports = {

    before: function(client) {
        client.closeWelcome();

        client
        .urlHash('notes')
        .expect.element('#header--add').to.be.present.before(50000);
    },

    after: function(client) {
        client.end();
    },

    'can show current title and add button': function(client) {
        client.expect.element('#header--title').to.have.text.that.equals('All Notes');
        client.expect.element('#header--add').to.be.present.before(5000);
        client.expect.element('#header--add').to.be.visible.before(5000);

        client.getTitle(function(title) {
            this.assert.equal(title, 'All Notes - Laverna');
        });
    },

    'can change title in notebooks page': function(client) {
        client.urlHash('notebooks');

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Notebooks & Tags')
        .before(5000);

        client.expect.element('#header--add').to.be.present.before(5000);
        client.expect.element('#header--add').to.be.visible.before(5000);

        client.getTitle(function(title) {
            this.assert.equal(title, 'Notebooks & Tags - Laverna');
        });
    },

    'can change title in trashed notes page': function(client) {
        client.urlHash('notes/f/trashed');

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Trashed')
        .before(5000);

        client.expect.element('#header--add').to.be.present.before(5000);
        client.expect.element('#header--add').to.be.visible.before(5000);

        client.getTitle(function(title) {
            this.assert.equal(title, 'Trashed - Laverna');
        });
    },

    'can change title in favorite notes page': function(client) {
        client.urlHash('notes/f/favorite');

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Favorites')
        .before(5000);

        client.expect.element('#header--add').to.be.present.before(5000);
        client.expect.element('#header--add').to.be.visible.before(5000);

        client.getTitle(function(title) {
            this.assert.equal(title, 'Favorites - Laverna');
        });
    },

    'search button shows input': function(client) {
        client.expect.element('#header--search').to.be.not.visible.before(5000);
        client.click('#header--sbtn');
        client.expect.element('#header--search').to.be.visible.before(5000);
    },

    'hitting ESCAPE hides search form': function(client) {
        client.pause(500);
        client.setValue('#header--search--input', client.Keys.ESCAPE);
        client.expect.element('#header--search').to.be.not.visible.before(5000);
    },

    'can show navbar sidemenu on click on #header--title': function(client) {
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
        client.click('#header--title');
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.present.before(5000);
    },

    'all urls are correct': function(client) {
        client
        .expect.element('#sidebar--navbar a[href="#/notes"]')
        .to.be.visible.before(5000);

        client
        .expect.element('#sidebar--navbar a[href="#/notes/f/favorite"]')
        .to.be.visible.before(5000);

        client
        .expect.element('#sidebar--navbar a[href="#/notes/f/trashed"]')
        .to.be.visible.before(5000);

        client
        .expect.element('#sidebar--navbar a[href="#/notebooks"]')
        .to.be.visible.before(5000);

        client
        .expect.element('#sidebar--navbar a[href="#/settings"]')
        .to.be.visible.before(5000);
    },

    'can be closed with a click on the close button': function(client) {
        client.click('#sidebar--navbar .sidemenu--close');
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
    },

    'can be closed with ESCAPE': function(client) {
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
        client.click('#header--title');
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.present.before(5000);

        client.keys(client.Keys.ESCAPE);
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
    },
};
*/
