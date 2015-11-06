
/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;
var Q = require('q');

/**
 * Add notebook form test
 */

describe('#/notebooks', function() {
    var ids;

    var createNotebook = function(client, item) {
        var defer = Q.defer();

        client
        .urlHash('notebooks')
        .pause(100)
        .urlHash('notebooks/add')
        .expect.element('#modal .form-group').to.be.visible.before(2000);

        client
        .perform((client, done) => {
            client.execute(function(filter) {
                var ops = document.querySelectorAll('#modal select[name="parentId"] option');
                for (var i = 0, len = ops.length; i < len; i++) {
                    if (filter && ops[i].text.indexOf(filter) > -1) {
                        document
                        .querySelector('#modal select[name="parentId"]')
                        .selectedIndex = ops[i].index;
                    }
                }
            }, [item.parent], function(res) {
                done();
            });
        })
        client.setValue('#modal input[name="name"]', [item.name, client.Keys.ENTER])
        .perform(function() {
            defer.resolve();
        });

        return defer.promise;
    };

    var createNotebooks = function(client) {
        var promises = [],
            notebooks = [
                {name: 'notebook 1', parent: 0},
                // {name: 'notebook 2', parent: 0},
                // {name: 'notebook 3', parent: 0},
                {name: 'notebook 4'},
                {name: 'notebook 5', parent: 'notebook 4'},
            ];

        notebooks.forEach(function(item) {
            promises.push(function() {
                return createNotebook(client, item);
            });
        });

        return promises.reduce(Q.when, new Q());
    };

    before(function(client, done) {
        this.timeout(100000);
        client
        .urlHash('notes');

        client
        .pause(100)
        .urlHash('notebooks');

        createNotebooks(client)
        .then(function() {
            client
            .urlHash('notes');

            client
            .pause(100)
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
                ids = res.value;
                done();
            });
        })
        .catch((e) => {console.log('ERROR:', e.toString());});
    });

    after(function(client, done) {
        done();
    });

    it('shows notebooks list', function(client) {
        expect(ids.length).not.to.be.equal(0);
        client.expect.element('#header--add').to.be.visible;
    });

    it('shows buttons that show menu', function(client) {
        client.expect.element('#notebooks .list--buttons .drop-edit').to.be.visible;
        client.expect.element('#notebooks .list--buttons .dropdown-menu').to.be.not.visible;
    });

    it('click on button shows show menu', function(client) {
        client.click('#notebooks .list--buttons .drop-edit');
        client.expect.element('#notebooks .list--buttons .dropdown-menu').to.be.visible;
        client.click('#notebooks .list--buttons .drop-edit');
    });

    it('edit button shows notebook form', function(client) {
        client
        .click('#notebooks .list--buttons .drop-edit')
        .click('#notebooks .list--buttons .edit-link');

        client.expect.element('#modal .form-group').to.be.present.before(2000);
        client.expect.element('#modal .form-group').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.pause(500);
    });

    it('remove button shows dialog', function(client) {
        client
        .click('#notebooks .list--buttons .drop-edit')
        .click('#notebooks .list--buttons .remove-link');

        client.expect.element('#modal .modal-title').to.be.present.before(2000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.pause(500);
        client.click('#notebooks .list--buttons .drop-edit')
    });

    it('add button shows notebook form', function(client) {
        client
        .click('#header--add');

        client.expect.element('#modal .modal-title').to.be.present.before(2000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.pause(500);
    });

    it('navigation keybindings work', function(client) {
        client.expect.element('#notebooks .list--item.active').to.be.not.present;
        client.keys('j');
        client.expect.element('#notebooks .list--item.active').to.be.present.before(500);

        client.getValue('#notebooks .list--item.active', function(value) {
            client.keys('j');
            client.expect.element('#notebooks .list--item.active').value.not.to.be.equal(value).before(5000);
        });

        client.getValue('#notebooks .list--item.active', function(value) {
            client.keys('k');
            client.expect.element('#notebooks .list--item.active').value.not.to.be.equal(value).before(5000);
        });
    });

    // :TODO Keybindings stop working when pressed in particular order
    // SHIFT+3, c, e and c, SHIFT+3, e
    it('`c` shows create form', function(client) {
        client.keys('c');

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .modal-title').not.to.be.present.before(2000);
    });

    it('`e` shows edit form', function(client) {
        client.keys('e');

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);
        client.keys(client.Keys.ESCAPE);
        client.expect.element('#modal .modal-title').not.to.be.present.before(2000);
    });

    it('SHIFT+3 shows delete form', function(client) {
        client.keys([client.Keys.SHIFT, '3']);

        client.expect.element('#modal .modal-title').to.be.present.before(5000);
        client.expect.element('#modal .modal-title').to.be.visible.before(2000);

        client.click('#modal .close');
        client.expect.element('#modal .modal-title').not.to.be.present.before(2000);
    });
});
