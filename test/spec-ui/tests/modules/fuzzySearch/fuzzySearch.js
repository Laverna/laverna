'use strict';

/**
 * Test fuzzy search module
 */
module.exports = {
    before: function(client) {
        client.closeWelcome();
    },

    after: function(client) {
        client.end();
    },

    'wait': function(client) {
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client.addNote({title: 'note1', content: 'content1'});
        client.addNote({title: 'note2', content: 'content2'});
        client.addNote({title: 'note3', content: 'content3'});
        client.addNote({title: 'Nightwatch', content: 'Nightwatch'});
    },

    'can show search form': function(client) {
        client.expect.element('#header--sbtn').to.be.present.before(5000);
        client.click('#header--sbtn');

        client.expect.element('#header--search--input').to.be.present.before(5000);
        client.expect.element('#header--search--input').to.be.visible.before(5000);
    },

    'can search by note\'s name': function(client) {
        client.clearValue('#header--search--input');
        client.expect.element('#sidebar--fuzzy').text.to.be.equal('');

        client
        .setValue('#header--search--input', 'note')
        .expect.element('#sidebar--fuzzy').text.to.be.not.equal('').before(5000);

        client.expect.element('#sidebar--fuzzy').text.to.contain('note1');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note2');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note3');
        client.expect.element('#sidebar--fuzzy').text.to.not.contain('Nightwatch');
    },

    'can close fuzzySearch module on Escape': function(client) {
        client
        .setValue('#header--search--input', client.Keys.ESCAPE)
        .expect.element('#sidebar--fuzzy').text.to.be.equal('').before(5000);
    },

    'can search by note\'s content': function(client) {
        client.click('#header--sbtn');
        client.expect.element('#header--search--input').to.be.present.before(5000);
        client.expect.element('#header--search--input').to.be.visible.before(5000);

        client.setValue('#header--search--input', 'content');

        client.expect.element('#sidebar--fuzzy').text.to.contain('note1').before(5000);
        client.expect.element('#sidebar--fuzzy').text.to.contain('note2');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note3');
        client.expect.element('#sidebar--fuzzy').text.to.not.contain('Nightwatch');
    },

    'after hitting ESCAPE notes are normally rendered': function(client) {
        client
        .clearValue('#header--search--input')
        .pause(1000)
        .setValue('#header--search--input', client.Keys.ESCAPE)
        .expect.element('#sidebar--fuzzy').to.be.not.visible.before(5000);

        client.expect.element('#header--search--input').to.be.not.visible.before(5000);

        client.expect.element('#sidebar--content').to.be.visible.before(5000);
        client.expect.element('#sidebar--content').text.to.contain('note1').before(5000);
        client.expect.element('#sidebar--content').text.to.contain('note2').before(5000);
        client.expect.element('#sidebar--content').text.to.contain('note3').before(5000);
        client.expect.element('#sidebar--content').text.to.contain('Nightwatch').before(5000);
    },

    'redirects to notes search page on `enter`': function(client) {
        client.expect.element('#header--sbtn').to.be.visible.before(5000);
        client.click('#header--sbtn');

        client.expect.element('#header--search--input').to.be.present.before(5000);
        client.expect.element('#header--search--input').to.be.visible.before(5000);

        client
        .clearValue('#header--search--input')
        .setValue('#header--search--input', 'note')
        .expect.element('#sidebar--fuzzy').text.to.be.not.equal('').before(5000);

        client.expect.element('#sidebar--fuzzy').text.to.contain('note1');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note2');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note3');
        client.expect.element('#sidebar--fuzzy').text.to.not.contain('Nightwatch');

        client
        .setValue('#header--search--input', client.Keys.ENTER)
        .assert.urlContains('notes/f/search/q/note');
    }
};
