/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Tag list test
 */
describe('#/notebooks tags', function() {
    var ids;

    before(function(client, done) {
        this.timeout(100000);
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client
        .pause(100)
        .urlHash('notebooks');

        client.addTag({name: 'tag 1'});
        client.addTag({name: 'tag 2'});
        client.addTag({name: 'tag 3'});

        client.urlHash('notes');

        client
        .pause(100)
        .urlHash('notebooks');

        client.findAll('#tags .list--item', 'data-id', (res) => {
            ids = res;
            done();
        });
    });

    after(function(client, done) {
        done();
    });

    it('shows tags list', function(client) {
        expect(ids.length).not.to.be.equal(0);
        client.expect.element('a[title="New tag"]').to.be.visible;
    });

    it('shows a button that shows menu', function(client) {
        client.expect.element('#tags .list--buttons .drop-edit').to.be.visible;
        client.expect.element('#tags .list--buttons .dropdown-menu').to.be.not.visible;
    });

    it('click on the button shows menu', function(client) {
        client.click('#tags .list--buttons .drop-edit');
        client.expect.element('#tags .list--buttons .dropdown-menu').to.be.visible;
        client.click('#tags .list--buttons .drop-edit');
    });

    it('edit button shows tag form', function(client) {
        client
        .click('#tags .list--buttons .drop-edit')
        .click('#tags .list--buttons .edit-link');

        client.expect.element('#modal .form-group').to.be.present.before(2000);
        client.expect.element('#modal .form-group').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
    });

    it('remove button shows dialog', function(client) {
        client
        .click('#tags .list--buttons .drop-edit')
        .click('#tags .list--buttons .remove-link');

        client.expect.element('#modal .modal-title').to.be.present.before(2000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
        client.click('#tags .list--buttons .drop-edit')
    });

    it('add button shows tag form', function(client) {
        client.click('a[title="New tag"]');

        client.expect.element('#modal .modal-title').to.be.present.before(2000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .form-group').not.to.be.present.before(5000);
    });

    // @TODO BUG: j,k keybindings don't work when there aren't any notebooks
    // it('navigation keybindings work', function(client) {
    //     client.expect.element('#tags .list--item.active').to.be.not.present;
    //
    //     client.perform((client, done) => {
    //         client.execute(function() {
    //             var el = document.querySelector('#tags .list--item');
    //             el.className += ' active';
    //         }, [], () => {done();});
    //     });
    //
    //     client.expect.element('#tags .list--item.active').to.be.present.before(500);
    //     client.getValue('#tags .list--item.active', function(value) {
    //         client.keys('j');
    //         client.expect.element('#tags .list--item.active').value.not.to.be.equal(value);
    //     });
    //
    //     client.getValue('#tags .list--item.active', function(value) {
    //         client.keys('k');
    //         client.expect.element('#tags .list--item.active').value.not.to.be.equal(value);
    //     });
    // });

    it('can filter notes by a tag name', function(client) {
        client.perform((client, done) => {
            client.getText('#tags .list--item.-tag', (res) => {
                client.click('#tags .list--item.-tag');

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
    });
});
