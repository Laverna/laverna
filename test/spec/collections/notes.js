/* global chai, define, describe, before, it */
define([
    'require',
    'collections/notes'
], function(require, Notes) {
    'use strict';

    var expect = chai.expect,
        /*jshint multistr: true */
        lorem = 'Lorem Ipsum is simply dummy text of the printing and \
        typesetting industry. Lorem Ipsum has been the industry\'s standard \
        dummy text ever since the 1500s, when an unknown printer took a galley\
        of type and scrambled it to make a type specimen book.';

    describe('Notes collection', function() {
        var notes;

        before(function() {
            var models = [];

            for (var i = 0; i < 20; i++) {
                models.push({
                    'id': i,
                    'title': 'Test note number ' + i,
                    'content': lorem + ' ' + i + ' content test content' + i
                });
            }

            notes = new Notes();
            notes.add(models);
        });

        describe('search', function() {

            it('collection is not empty', function() {
                expect(notes.length !== 0).to.be.equal(true);
            });

            it('can search', function() {
                expect(notes.searchFilter('Test note').length).to.be.equal(notes.length);
                expect(notes.searchFilter('number ' + String(notes.length - 1)).length).to.be.equal(1);
            });

            it('case insensetive search', function() {
                expect(notes.searchFilter('test').length).to.be.equal(notes.length);
                expect(notes.searchFilter('NotE').length).to.be.equal(notes.length);
                expect(notes.searchFilter('NUMBER').length).to.be.equal(notes.length);
            });

            it('full text search', function() {
                expect(notes.searchFilter('content').length).to.be.equal(notes.length);
                expect(notes.searchFilter('lorem').length).to.be.equal(notes.length);
                expect(notes.searchFilter('content' + String(notes.length - 1)).length).to.be.equal(1);
            });

        });

    });

});
