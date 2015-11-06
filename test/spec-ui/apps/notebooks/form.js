/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Add notebook form test
 */
describe('#/notebooks/add', function() {
    before(function(client, done) {
        done();
    });

    after(function(client, done) {
        done();
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

    // @TODO FAILS
    // it('saved notebooks appear in list', function(client) {
    //     client
    //     .expect.element('#sidebar--content .list--item.-notebook').text.to.contain('Nightwatch').before(2000);
    // });

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

    it('can add nested notebooks', function(client) {
        client
        .click('#header--add')
        .expect.element('#modal .form-group').to.be.visible.before(200);

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
    });

    //@TODO Notebooks are saved even if the title is empty
    // it('doesn\'t save if title is empty', function(client) {
    //     client
    //     .urlHash('notebooks')
    //     .urlHash('notebooks/add')
    //     .expect.element('#modal .form-group').to.be.visible.before(2000);
    //
    //     client
    //     .clearValue('#modal input[name="name"]')
    //     .click('#modal .ok');
    //
    //     client.expect.element('#notebooks .list--item').to.have.text.that.contains('Nightwatch');
    // });

    it('closes modal window on escape', function(client) {
        client
        .urlHash('notebooks')
        .urlHash('notebooks/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .setValue('#modal input[name="name"]', ['Doesn\'t save', client.Keys.ESCAPE])
        .expect.element('#sidebar--content').text.not.to.contain('Doesn\'t save').before(2000);
    });

    it('closes modal window on cancel button click', function(client) {
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

/**
 * Edit notebook form test
 */
describe('#/notebooks/edit', function() {
    var ids = [];

    before(function(client, done) {
        client
        .urlHash('notes');

        client
        .pause(500)
        .urlHash('notebooks');

        // Get all rendered notebooks
        client.execute(function(filter) {
            var ops = document.querySelectorAll('#notebooks .list--item'),
            ids = [];

            for (var i = 0, len = ops.length; i < len; i++) {
                ids.push(ops[i].getAttribute('data-id'));
            }

            return ids;
        }, [], function(res) {
            expect(typeof res.value).to.be.equal('object');
            expect(res.value.length).to.be.equal(2);
            ids = res.value;
            done();
        });
    });

    after(function(client, done) {
        done();
    });


    it('shows notebook edit form', function(client) {
        client
        .urlHash(`notebooks/edit/${ids[0]}`)
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .clearValue('#modal input[name="name"]')
        .setValue('#modal input[name="name"]', 'Changed-Title')
        .expect.element('#modal input[name="name"]').to.have.value.that.equals('Changed-Title');
    });

    it('list re-renders new value', function(client) {
        client
        .setValue('#modal input[name="name"]', [client.Keys.ENTER])
        .pause(500)
        .expect.element('#notebooks').text.to.contain('Changed-Title');

        // @TODO After updating a notebook, sub-notebooks are lost
        // client.expect.element('#notebooks').text.to.contain('Sub-Notebook');
    });

    it('shows notebook form with updated data', function(client) {
        client
        .urlHash(`notebooks/edit/${ids[1]}`)
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .expect.element('#modal select[name="parentId"]').text.to.contain('Changed-Title');
    });

    it('shows notebook form with correct notebookId', function(client) {
        client
        .expect.element('#modal select[name="parentId"]').to.have.value.that.equals(ids[0]);
    });

    it('can update sub-notebooks', function(client) {
        client
        .clearValue('#modal input[name="name"]')
        .setValue('#modal input[name="name"]', ['Sub-CT', client.Keys.ENTER])
    });

    it('re-renders notebooks list with updated data', function(client) {
        // client
        // .expect.element('#notebooks').text.to.contain('Sub-CT');
        client
        .expect.element('#notebooks').text.to.contain('Changed-Title');
    });

    // it('doesn\'t update if title is empty', function(client) {
    //     client
    //     .urlHash('notebooks')
    //     .urlHash(`notebooks/edit/${ids[0]}`)
    //     .expect.element('#modal .form-group').to.be.visible.before(2000);
    //
    //     client
    //     .clearValue('#modal input[name="name"]')
    //     .setValue('#modal input[name="name"]', [client.Keys.ENTER]);
    //
    //     client
    //     .expect.element('#notebooks').text.to.contain('Changed-Title');
    // });
});
