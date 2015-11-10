/* global describe, before, after, it */
'use strict';
var expect = require('chai').expect;

/**
 * Notebook list test
 */

describe('#/notebooks', function() {
    before(function(client, done) {
        this.timeout(100000);
        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client.addNote({title: 'hello', content: 'hello'});
        client.addNote({title: 'hello2', content: 'hello2'});
        client.addNote({title: 'hello3', content: 'hello3'});

        // client.addNotebook({name: 'AAAAAA', parentId: 0});
        // client.addNotebook({name: 'AAAAAB', parentId: 0});

        client.urlHash('settings');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(5000);
        client.perform(() => {done();})
    });

    after(function(client, done) {
        done();
    });

    it('general tab is open by default', function(client) {
        client
        .expect.element('.list--settings.active').to.have.text.that.contains('General');
    });

    it('can change how many notes should be displayed', function(client) {
        // Set pagination to 1
        client.clearValue('input[name="pagination"]');
        client.setValue('input[name="pagination"]', '1');

        client.click('.settings--save');
        client.click('.settings--cancel');

        client.expect.element('#header--add').to.be.visible.before(50000);

        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client.findAll('#sidebar--content .list--item.-note', 'data-id', (res) => {
            client.assert.equal(res.length, 1);
        });

        // Set pagination to 10
        client.urlHash('settings');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(5000);

        client.clearValue('input[name="pagination"]');
        client.setValue('input[name="pagination"]', '10');

        client.click('.settings--save');
        client.click('.settings--cancel');

        client.expect.element('#header--add').to.be.visible.before(50000);

        client.urlHash('notes');
        client.expect.element('#header--add').to.be.visible.before(50000);

        client.findAll('#sidebar--content .list--item.-note', 'data-id', (res) => {
            client.assert.notEqual(res.length, 1);
        });
    });

    it('can change default edit mode', function(client) {
        client.urlHash('settings');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(5000);

        client.setValue('select[name="editMode"]', 'normal');

        client.click('.settings--save');
        client.click('.settings--cancel');

        client.expect.element('#header--add').to.be.visible.before(50000);

        client.urlHash('notes/add');
        client.expect.element('#editor').to.be.visible.before(5000);
        client.expect.element('#header--add').to.be.visible.before(5000);
        client.expect.element('#sidebar--content').to.be.visible.before(5000);
    });

    // @TODO Sort notebooks doesn't work
    // it('can change default edit mode', function(client) {
    //     client.urlHash('settings');
    //     client.expect.element('.header--title').to.have.text.that.contains('Settings').before(5000);
    //
    //     client.setValue('select[name="sortnotebooks"]', 'id');
    //
    //     client.click('.settings--save');
    //     client.click('.settings--cancel');
    //
    //     client.expect.element('#header--add').to.be.visible.before(50000);
    //
    //     client.urlHash('notebooks');
    //     client.expect.element('#notesbooks .list--item.-notebook').to.have.text.that.equals('AAAAAB').before(5000);
    // });
});
