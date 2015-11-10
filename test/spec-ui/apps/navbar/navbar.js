/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Add notebook form test
 */
describe('Navbar', function() {
    before(function(client, done) {
        client
        .urlHash('notes')
        .expect.element('#header--add').to.be.present.before(50000); 
        client.perform(() => {done();});
    });

    after(function(client, done) {
        done();
    });

    it('can show current title and add button', function(client) {
        client.expect.element('#header--title').to.have.text.that.equals('All notes');
        client.expect.element('#header--add').to.be.present;
        client.expect.element('#header--add').to.be.visible;

        client.getTitle(function(title) {
            this.assert.equal(title, 'All notes - Laverna');
        });
    });

    it('can change title in notebooks page', function(client) {
        client.urlHash('notebooks');

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Notebooks & Tags')
        .before(5000);

        client.expect.element('#header--add').to.be.present;
        client.expect.element('#header--add').to.be.visible;

        client.getTitle(function(title) {
            this.assert.equal(title, 'Notebooks & Tags - Laverna');
        });
    });

    it('can change title in trashed notes page', function(client) {
        client.urlHash('notes/f/trashed');

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Trashed')
        .before(5000);

        client.expect.element('#header--add').to.be.present;
        client.expect.element('#header--add').to.be.visible;

        client.getTitle(function(title) {
            this.assert.equal(title, 'Trashed - Laverna');
        });
    });

    it('can change title in favourite notes page', function(client) {
        client.urlHash('notes/f/favorite');

        client
        .expect.element('#header--title')
        .to.have.text.that.equals('Favourites')
        .before(5000);

        client.expect.element('#header--add').to.be.present;
        client.expect.element('#header--add').to.be.visible;

        client.getTitle(function(title) {
            this.assert.equal(title, 'Favourites - Laverna');
        });
    });

    it('search button shows input', function(client) {
        client.expect.element('#header--search').to.be.not.visible;
        client.click('#header--sbtn');
        client.expect.element('#header--search').to.be.visible.before(5000);
    });

    it('hitting ESCAPE hides search form', function(client) {
        client.pause(500);
        client.setValue('#header--search--input', client.Keys.ESCAPE);
        client.expect.element('#header--search').to.be.not.visible.before(5000);
    });
});

describe('Navbar sidemenu', function() {
    before(function(client, done) {
        client
        .urlHash('notes')
        .expect.element('#header--add').to.be.present.before(50000);

        client.perform(() => {done();});
    });

    after(function(client, done) {
        done();
    });

    it('can show navbar sidemenu on click on #header--title', function(client) {
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
        client.click('#header--title');
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.present.before(5000);
    });

    it('all urls are correct', function(client) {
        client
        .expect.element('#sidebar--navbar a[href="#/notes"]')
        .to.be.visible;

        client
        .expect.element('#sidebar--navbar a[href="#/notes/f/favorite"]')
        .to.be.visible;

        client
        .expect.element('#sidebar--navbar a[href="#/notes/f/trashed"]')
        .to.be.visible;

        client
        .expect.element('#sidebar--navbar a[href="#/notebooks"]')
        .to.be.visible;

        client
        .expect.element('#sidebar--navbar a[href="#/settings"]')
        .to.be.visible;
    });

    it('can be closed with a click on the close button', function(client) {
        client.click('#sidebar--navbar .sidemenu--close');
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
    });

    it('can be closed with ESCAPE', function(client) {
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
        client.click('#header--title');
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.present.before(5000);

        client.keys(client.Keys.ESCAPE);
        client.expect.element('#sidebar--navbar .sidemenu.-show').to.be.not.present.before(5000);
    });
});
