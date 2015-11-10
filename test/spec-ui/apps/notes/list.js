/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

describe('/notes', function() {

    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        done();
    });

    it('opens #/notes', function(client) {
        client
        .urlHash('notes')
        .expect.element('.list').to.be.present.before(50000);
    });

    it('renders new notes', function(client) {
        for (var i = 1; i <= 15; i++) {
            client.addNote({title: i + '. Note', content: 'Nightwatch test content ' + i + '.'});
        }

        client
        .urlHash('/notes')
        .expect.element('.list').to.be.present.before(2000);
    });

    it('shows pagination buttons', function(client) {
        client
        .expect.element('.list--pager').to.be.visible.before(2000);
    });

    it('is possible to navigate by pressing "j" key', function(client) {
        client
        .expect.element('.list--item.active').not.to.be.present.before(500);

        client
        .keys(['j'])
        .expect.element('.list--item.active').to.be.visible.before(2000);
    });

    it('is possible to navigate by pressing "k" key', function(client) {
        client
        .pause(300)
        .keys(['j'])
        .expect.element('.list--item:first-child').to.have.attribute('class').which.does.not.contain('active').before(2000);

        client
        .pause(300)
        .keys(['k'])
        .expect.element('.list--item:first-child').to.have.attribute('class').which.contains('active').before(2000);
    });

    it('if it reaches the last note on the page, it navigates to the next page', function(client) {
        client.expect.element('#prevPage').to.have.attribute('class').which.contains('disabled');
        client.expect.element('#nextPage').to.have.attribute('class').which.does.not.contain('disabled');

        for (var i = 0; i < 14; i++) {
            client
            .pause(300)
            .keys(['j']);
        }

        client.expect.element('.list--item.active').to.be.visible.before(2000);
        client.expect.element('#prevPage').to.have.attribute('class').which.does.not.contain('disabled').before(2000);
        client.expect.element('#nextPage').to.have.attribute('class').which.contains('disabled').before(2000);
    });

    it('if it reaches the first note on the page, it navigates to the previous page', function(client) {
        client.expect.element('#prevPage').to.have.attribute('class').which.does.not.contain('disabled').before(2000);
        client.expect.element('#nextPage').to.have.attribute('class').which.contains('disabled').before(2000);

        for (var i = 0; i < 10; i++) {
            client
            .pause(300)
            .keys(['k']);
        }

        client.expect.element('.list--item.active').to.be.visible.before(2000);
        client.expect.element('#prevPage').to.have.attribute('class').which.contains('disabled');
        client.expect.element('#nextPage').to.have.attribute('class').which.does.not.contain('disabled');
    });

    it('can add a new note by pressing "c"', function(client) {
        client
        .keys('c')
        .expect.element('.layout--body.-form').to.be.present.before(2000);

        client
        .keys(client.Keys.ESCAPE)
        .expect.element('.layout--body.-form').not.to.be.present.before(2000);
    });

    it('changes favourite status of an active note if favourite button is clicked', function(client) {
        client
        .click('.list--group:first-child .favorite')
        .expect.element('.list--group:first-child .icon-favorite').to.be.present.before(2000);

        client
        .click('.list--group:first-child .favorite')
        .expect.element('.list--group:first-child .icon-favorite').not.to.be.present.before(2000);

        client
        .click('.list--group:first-child .favorite')
        .waitForElementPresent('.list--group:first-child .icon-favorite', 2000);
    });

    it('navigates to favourite page on "gf" shortcut', function(client) {
        client
        .keys('gf')
        .pause(300)
        .assert.urlContains('notes/f/favorite');
    });

    it('navigates to trash page on "gt" shortcut', function(client) {
        client
        .keys('gt')
        .pause(300)
        .assert.urlContains('notes/f/trashed');
    });

    it('navigates to active page on "gi" shortcut', function(client) {
        client
        .keys('gi')
        .pause(300)
        .url(function(url) {
            expect(url.value.search('notes/f/trashed') !== -1).not.to.be.equal(true);
            expect(url.value.search('notes/f/favorite') !== -1).not.to.be.equal(true);
            expect(url.value.search('notes') !== -1).to.be.equal(true);
        });
    });

    it('navigates to notebook page on "gn" shortcut', function(client) {
        client
        .keys('gn')
        .pause(300)
        .assert.urlContains('notebooks');
    });

    /**
     * @TODO It doesn't filter notes by search query
     */
    it('can search notes', function(client) {
        var note = {
            title   : 'A unique note title:' + Math.floor((Math.random() * 10) + 1),
            content : 'A unique note content'
        };
        client.addNote(note);

        client
        .urlHash('notes/f/search/q/' + note.title)
        .expect.element('.list').to.be.present.before(50000);

        client.expect.element('.list').text.to.contain(note.title).before(2000);
        client.elements('css selector', '.list--item', function(res) {
            this.assert.equal(res.value.length, 1);
        });
    });

});
