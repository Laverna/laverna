/* global describe, before, it */
'use strict';
var expect = require('chai').expect;

describe('/notes/f/active/show/:id:', function() {

    before(function(client, done) {
        done();
    });

    it('wait', function(client) {
        client
        .urlHash('notes')
        .expect.element('.list').to.be.present.before(50000);
    });

    it('can open a note from the list', function(client) {
        client
        .addNote({title: 'A new note', content: 'Note content\r[ ] A task\r[ ] The second task'})
        .addNote({title: 'A second note', content: 'Note content 2\r[ ] A task\r[ ] The second task'})
        .urlHash('notebooks')
        .pause(200)
        .urlHash('notes')
        .expect.element('.list').to.be.present.before(5000);

        client
        .keys(['j'])
        .pause(500)
        .expect.element('.list--item.active').to.be.visible.before(3000);

        client.expect.element('.layout--body.-note').to.be.present.before(2000);
        client.assert.urlContains('notes/f/active/show/');
    });

    it('shows edit button', function(client) {
        client.expect.element('.note--edit').to.be.visible.before(2000);
    });

    it('shows remove button', function(client) {
        client.expect.element('.note--remove').to.be.visible.before(2000);
    });

    it('shows "favourite" button', function(client) {
        client.expect.element('.btn--favourite').to.be.visible.before(2000);
    });

    it('has tasks', function(client) {
        client.expect.element('.layout--body.-note').to.be.present.before(5000);
        client.expect.element('.layout--body.-note .checkbox--input').to.be.present.before(5000);
    });

    it('shows the task progress', function(client) {
        client.expect.element('.layout--body.-note .progress-bar').to.be.visible.before(200);
        client.expect.element('.layout--body.-note .progress-bar').to.have.css('width', '0%');
    });

    it('changes a task\'s status when a checkbox is clicked', function(client) {
        client
        .click('.layout--body.-note .checkbox')
        .expect.element('.layout--body.-note .checkbox input:checked').to.be.present.before(5000);

        client.pause(500);
    });

    it('changes the task progress %', function(client) {
        client.expect.element('.layout--body.-note .progress-bar').to.have.css('width').which.not.equal('0%');
    });

    it('opens the edit page if the edit button is clicked', function(client) {
        client
        .click('.note--edit')
        .expect.element('.layout--body.-form').to.be.present.before(4000);

        client
        .keys([client.Keys.ESCAPE])
        .expect.element('.layout--body.-form').not.to.be.present.before(4000);
    });

    it('removes a note if the remove button is clicked', function(client) {
        client
        .click('.note--remove')
        .expect.element('.modal-dialog').to.be.present.before(2000);

        client
        .keys([client.Keys.ESCAPE])
        .expect.element('.modal-dialog').not.to.be.present.before(2000);
    });

    it('changes favourite status if the button is clicked', function(client) {
        client
        .perform(function(client, done) {
            client.getAttribute('.btn--favourite--icon', 'class', function(res) {
                var isFavourite = res.value.search('icon-favorite') > -1;

                client
                .click('.btn--favourite');

                if (isFavourite) {
                    client.expect.element('.btn--favourite--icon').to.have.attribute('class').which.contains('icon-favorite');
                    return done();
                }

                client.expect.element('.btn--favourite--icon').to.have.attribute('class').which.does.not.contain('icon-favorite');
                return done();
            });
        });
    });

    it('opens edit page if "e" is pressed', function(client) {
        client.expect.element('.layout--body.-note').to.be.present.before(2000);

        client
        .pause(300)
        .keys(['e'])
        .expect.element('.layout--body.-form').to.be.present.before(4000);

        client
        .click('.editor--cancel')
        .expect.element('.layout--body.-form').not.to.be.present.before(4000);
    });

    it('shows delete dialog on "Shift+3" key combination', function(client) {
        client.expect.element('.layout--body.-note').to.be.present.before(2000);

        client
        .pause(1000)
        .keys([client.Keys.SHIFT, '3'])

        // Hit Shift key again to disable it
        .keys([client.Keys.SHIFT])
        .expect.element('.modal-dialog').to.be.present.before(2000);
    });

    it('deletes a note', function(client) {
        client.expect.element('.modal-dialog .btn-success').to.be.present.before(2000);

        client
        .perform(function(cli, done) {
            cli.getAttribute('.list--group:first-child .list--item', 'data-id', function(res) {
                client
                .pause(500)
                .click('.modal-dialog .btn-success')
                .expect.element('.modal-dialog').not.to.be.present.before(5000);

                client.expect.element('.list--group:first-child .list--item').to.be.present.before(2000);

                cli
                .getAttribute('.list--group:first-child .list--item', 'data-id', function(newRes) {
                    expect(newRes.value).not.to.be.equal(res.value);
                    done();
                });
            });
        });
    });

});
