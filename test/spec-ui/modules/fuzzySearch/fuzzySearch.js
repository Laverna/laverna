/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Add notebook form test
 */
describe('Navbar', function() {
    var ids;

    before(function(client, done) {
        this.timeout(100000);
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client.addNote({title: 'note1', content: 'content1'});
        client.addNote({title: 'note2', content: 'content2'});
        client.addNote({title: 'note3', content: 'content3'});
        client.addNote({title: 'Nightwatch', content: 'Nightwatch'});
        client.perform(() => {done();});
    });

    after(function(client, done) {
        done();
    });

    it('can show search form', function(client) {
        client.click('#header--sbtn');
        client.expect.element('#header--search--input').to.be.visible.before(5000);
    });

    it('can search by note\'s name', function(client) {
        client.clearValue('#header--search--input');
        client.expect.element('#sidebar--fuzzy').text.to.be.equal('');

        client.setValue('#header--search--input', 'note');
        client
        .expect.element('#sidebar--fuzzy').text.to.be.not.equal('')
        .before(5000);

        client.expect.element('#sidebar--fuzzy').text.to.contain('note1');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note2');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note3');
        client.expect.element('#sidebar--fuzzy').text.to.not.contain('Nightwatch');

        client.setValue('#header--search--input', client.Keys.ESCAPE);
        client
        .expect.element('#sidebar--fuzzy').text.to.be.equal('')
        .before(5000);
    });

    it('can search by note\'s content', function(client) {
        client.click('#header--sbtn');
        client.expect.element('#header--search--input').to.be.visible.before(5000);

        client.setValue('#header--search--input', 'content');
        client
        .expect.element('#sidebar--fuzzy').text.to.be.not.equal('')
        .before(5000);

        client.expect.element('#sidebar--fuzzy').text.to.contain('note1');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note2');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note3');
        client.expect.element('#sidebar--fuzzy').text.to.not.contain('Nightwatch');
    });

    // @TODO After fuzzySearch, notes are not shown again on small screens
    it('after hitting ESCAPE notes are normally rendered', function(client) {
        client.clearValue('#header--search--input');
        client.setValue('#header--search--input', client.Keys.ESCAPE);
        client
        .expect.element('#sidebar--fuzzy').to.be.not.visible
        .before(5000);

        client.expect.element('#header--search--input').to.be.not.visible;

        client.expect.element('#sidebar--content').text.to.contain('note1').before(5000);
        client.expect.element('#sidebar--content').text.to.contain('note2').before(5000);
        client.expect.element('#sidebar--content').text.to.contain('note3').before(5000);
        client.expect.element('#sidebar--content').text.to.contain('Nightwatch').before(5000);
    });

    it('enter redirects to notes search page', function(client) {
        client.click('#header--sbtn');
        client.expect.element('#header--search--input').to.be.visible.before(5000);

        client.clearValue('#header--search--input');
        client.setValue('#header--search--input', 'note');
        client
        .expect.element('#sidebar--fuzzy').text.to.be.not.equal('')
        .before(5000);

        client.expect.element('#sidebar--fuzzy').text.to.contain('note1');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note2');
        client.expect.element('#sidebar--fuzzy').text.to.contain('note3');
        client.expect.element('#sidebar--fuzzy').text.to.not.contain('Nightwatch');

        client.setValue('#header--search--input', client.Keys.ENTER);
        client.assert.urlContains('notes/f/search/q/note');
    });
});
