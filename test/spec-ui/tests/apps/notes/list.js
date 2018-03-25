'use strict';
var expect = require('chai').expect;

module.exports = {
    before: function(client) {
        client.closeWelcome();
    },

    after: function(client) {
        client.end();
    },

    'opens #/notes': function(client) {
        client
        .urlHash('notes')
        .expect.element('.list').to.be.present.before(50000);
    },

    'renders new notes': function(client) {
        for (var i = 1; i <= 15; i++) {
            client.addNote({title: i + '. Note', content: 'Nightwatch test content ' + i + '.'});
        }

        client
        .urlHash('/notes')
        .expect.element('.list').to.be.present.before(2000);
    },

    'shows pagination buttons': function(client) {
        client
        .expect.element('.list--pager').to.be.visible.before(2000);
    },

    'is possible to navigate by pressing "j" key': function(client) {
        client
        .expect.element('.list--item.active').not.to.be.present.before(500);

        client
        .pause(300)
        .keys(['j'])
        .expect.element('.list--item.active').to.be.visible.before(5000);
    },

    'is possible to navigate by pressing "k" key': function(client) {
        client
        .pause(300)
        .keys(['j'])
        .expect.element('.list--item:first-child').to.have.attribute('class').which.does.not.contain('active').before(5000);

        client
        .pause(300)
        .keys(['k'])
        .expect.element('.list--item:first-child').to.have.attribute('class').which.contains('active').before(5000);
    },

    'if it reaches the last note on the page, it navigates to the next page': function(client) {
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
    },

    'if it reaches the first note on the page, it navigates to the previous page': function(client) {
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
    },

    // 'can add a new note by pressing "c"': function(client) {
    //     client
    //     .keys('c')
    //     .expect.element('.layout--body.-form').to.be.present.before(2000);
    //
    //     client
    //     .keys(client.Keys.ESCAPE)
    //     .expect.element('.layout--body.-form').not.to.be.present.before(2000);
    // },

    'changes favorite status of an active note if favorite button is clicked': function(client) {
        client
        .click('.list--group .favorite')
        .expect.element('.list--group .icon-favorite').to.be.present.before(2000);

        client
        .click('.list--group .favorite')
        .expect.element('.list--group .icon-favorite').not.to.be.present.before(2000);

        client
        .click('.list--group .favorite')
        .waitForElementPresent('.list--group .icon-favorite', 2000);
    },

    'navigates to favorite page on "gf" shortcut': function(client) {
        client
        .keys('gf')
        .pause(300)
        .assert.urlContains('notes/f/favorite');
    },

    'navigates to trash page on "gt" shortcut': function(client) {
        client
        .keys('gt')
        .pause(300)
        .assert.urlContains('notes/f/trashed');
    },

    'navigates to active page on "gi" shortcut': function(client) {
        client
        .keys('gi')
        .pause(300)
        .url(function(url) {
            expect(url.value.search('notes/f/trashed') !== -1).not.to.be.equal(true);
            expect(url.value.search('notes/f/favorite') !== -1).not.to.be.equal(true);
            expect(url.value.search('notes') !== -1).to.be.equal(true);
        });
    },

    'navigates to notebook page on "gn" shortcut': function(client) {
        client
        .keys('gn')
        .pause(300)
        .assert.urlContains('notebooks');
    },

    'can filter notes by a notebook name': function(client) {
        var note = {
            title    : 'A note with a notebook:' + Math.floor((Math.random() * 10) + 1),
            content  : 'A note content with a notebook.',
            notebook : 'Notebook:' + Math.floor((Math.random() * 10) + 1)
        };

        client.addNote(note);

        client
        .keys('gn')
        .pause(300)
        .expect.element('.list--item.-notebook').to.be.present.before(50000);

        client.getAttribute('partial link text', note.notebook, 'data-id', function(res) {
            this.assert.equal(typeof res.value !== 'undefined', true);

            client
            .urlHash('notes/f/notebook/q/' + res.value)
            .expect.element('.list').to.be.present.before(50000);

            client.expect.element('#sidebar--content').to.have.text.that.contains(note.title).before(5000);
            client.elements('css selector', '.list--item', function(res) {
                this.assert.equal(res.value.length, 1);
            });
        });
    },

    'can filter notes by a tag': function(client) {
        var note = {
            title   : 'A note with a tag:' + Math.floor((Math.random() * 10) + 1),
            content : [client.Keys.SHIFT, '3', client.Keys.SHIFT, 'tagname']
        };

        client
        .addNote(note)
        .keys('gn');

        client
        .urlHash('notes/f/tag/q/tagname')
        .expect.element('.list').to.be.present.before(50000);

        client.expect.element('.list--item').to.be.present.before(50000);

        client.expect.element('#sidebar--content').to.have.text.that.contains(note.title).before(5000);
        client.elements('css selector', '.list--item', function(res) {
            this.assert.equal(res.value.length, 1);
        });
    },

    'can search notes': function(client) {
        var note = {
            title   : 'A unique note title:' + Math.floor((Math.random() * 10) + 1),
            content : 'A unique note content'
        };
        client.addNote(note);

        client
        .pause(300)
        .urlHash('notes/f/search/q/' + note.title)
        .expect.element('.list').to.be.present.before(50000);

        client.pause(500);
        client.expect.element('#sidebar--content').to.have.text.that.contains(note.title).before(5000);
        client.elements('css selector', '.list--item.-note', function(res) {
            this.assert.equal(res.value.length, 1);
        });
    },
};
