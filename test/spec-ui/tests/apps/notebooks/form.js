'use strict';
var expect = require('chai').expect;

/**
 * Add notebook form test
 */
module.exports = {

    before: function(client) {
        client.closeWelcome();
    },

    after: function(client) {
        client.end();
    },

    /**
     * Saves a notebook
     */
    'can show notebook form when button is clicked': function(client) {
        client
        .urlHash('notebooks')
        .expect.element('#header--add').to.be.present.before(50000);

        client.click('#header--add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);
    },

    'can change title of a notebook': function(client) {
        client
        .expect.element('#modal .form-group').to.be.visible.before(50000);

        client.setValue('#modal input[name="name"]', ['Nightwatch'])
        .expect.element('#modal input[name="name"]').value.to.contain('Nightwatch');
    },

    'can save notebooks': function(client) {
        client
        .expect.element('#modal .ok').text.to.contain('Save');

        client
        .click('#modal .ok')
        .expect.element('#modal .form-group').not.to.be.present.before(5000);
    },

    'saved notebooks appear in list': function(client) {
        client
        .expect.element('#notebooks .list--item.-notebook').text.to.contain('Nightwatch').before(5000);
    },

    'redirects to notebooks list on save': function(client) {
        client
        .pause(500)
        .url(function(data) {
            expect(data.value).to.contain('#notebooks');
            expect(data.value).not.to.contain('/add');
        });

    },

    'saved notebooks appear in the add form': function(client) {
        client.click('#header--add')
        .expect.element('#modal select[name="parentId"]').text.to.contain('Nightwatch').before(2000);
    },

    'can add nested notebooks': function(client) {
        client
        .click('#header--add')
        .expect.element('#modal .form-group').to.be.present.before(5000);

        client
        .setValue('#modal input[name="name"]', ['Sub-notebook'])
        // Change parentId of a notebook
        .perform((client, done) => {
            client.execute(function(filter) {
                var ops = document.querySelectorAll('#modal select[name="parentId"] option'),
                    res = false;

                for (var i = 0, len = ops.length; i < len; i++) {
                    if (ops[i].text.indexOf(filter) > -1) {
                        document
                        .querySelector('#modal select[name="parentId"]')
                        .selectedIndex = ops[i].index;

                        res = true;
                    }
                }

                return res;
            }, ['Nightwatch'], function(res) {
                expect(res.value).to.be.equal(true);
                done();
            });
        })
        .setValue('#modal input[name="name"]', [client.Keys.ENTER]);
    },

    'doesn\'t save if title is empty': function(client) {
        client
        .urlHash('notebooks')
        .urlHash('notebooks/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .clearValue('#modal input[name="name"]')
        .click('#modal .ok');

        client.expect.element('#notebooks .list--item').to.have.text.that.contains('Nightwatch');
    },

    'closes modal window on escape': function(client) {
        client
        .urlHash('notebooks')
        .urlHash('notebooks/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save', client.Keys.ESCAPE])
        .expect.element('#notebooks').text.not.to.contain('Doesn\'t save').before(2000);
    },

    'closes modal window on cancel button click': function(client) {
        client
        .urlHash('notebooks')
        .urlHash('notebooks/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save'])
        .click('#modal .cancelBtn')
        .expect.element('#notebooks').text.not.to.contain('Doesn\'t save').before(2000);
    },
};
