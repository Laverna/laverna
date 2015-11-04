/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

describe('#/notebooks/add', function() {
    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        client.end(function() {
            done();
        });
    });

    /**
     * Saves a notebook
     */
    it('can show notebook form throught button', function(client) {
        client
            .urlHash('notebooks')
            .expect.element('#header--add').to.be.present.before(50000);

        client.click('#header--add')
            .expect.element('#modal .form-group').to.be.visible.before(2000);
    });

    it('can change notebook title', function(client) {
        client
            .expect.element('#modal .form-group').to.be.visible.before(50000);

        client.setValue('#modal input[name="name"]', ['Nightwatch'])
            .expect.element('#modal input[name="name"]').value.to.contain('Nightwatch');
    });

    it('can save notebook', function(client) {
        client
            .expect.element('#modal .ok').text.to.contain('Save');

        client
            .click('#modal .ok')
            .expect.element('#modal .form-group').not.to.be.present.before(2000);
    });

    it('saved notebooks appear in list', function(client) {
        client
            .expect.element('#sidebar--content .list--item.-notebook').text.to.contain('Nightwatch').before(2000);
    });

    it('redirects to notebooks list on save', function(client) {
        client
            .pause(500)
            .url(function(data) {
                expect(data.value).to.contain('#notebooks');
                expect(data.value).not.to.contain('/add');
            });

    });

    it('saved notebooks appear in the add form', function(client) {
        client
            client.click('#header--add')
            .expect.element('#modal select[name="parentId"]').text.to.contain('Nightwatch').before(2000);
    });

    // it('can add nested notebooks', function(client) {
    //     client
    //         .click('#header--add')
    //         .expect.element('#modal .form-group').to.be.visible.before(200);
    //
    //     client
    //         .setValue('#modal input[name="name"]', ['Sub notebook'])
    //         .perform((client, done) => {
    //             console.log(client.elements('css selector', '#modal select[name="parentId"] option'));
    //         // .expect.element('#modal select[name="parentId"] option').which.contains('Nightwatch').to.be.present.before(2000);
    //         });
    // });

    it('doesn\'t save on escape', function(client) {
        client
            .urlHash('notebooks')
            .urlHash('notebooks/add')
            .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
            .setValue('#modal input[name="name"]', ['Doesn\'t save', client.Keys.ESCAPE])
            .expect.element('#sidebar--content').text.not.to.contain('Doesn\'t save').before(2000);
    });

    it('doesn\'t save on cancel', function(client) {
        client
            .urlHash('notebooks')
            .urlHash('notebooks/add')
            .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
            .setValue('#modal input[name="name"]', ['Doesn\'t save'])
            .click('#modal .cancelBtn')
            .expect.element('#sidebar--content').text.not.to.contain('Doesn\'t save').before(2000);
    });

});
