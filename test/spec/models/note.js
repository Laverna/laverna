/* global chai, define, describe, beforeEach, it */
define([
    'require',
    'helpers/underscore-util',
    'models/note'
], function(require, _, Note) {
    'use strict';

    var expect = chai.expect;

    describe('Note Model', function() {
        var note;

        beforeEach(function() {
            note = new Note();
        });

        describe('instance', function() {

            it('should be instance of Note Model', function() {
                expect(note instanceof Note).to.be.equal(true);
            });

        });

        describe('default values', function() {

            it('"id" is undefined', function() {
                expect(typeof note.get('id')).to.be.equal('undefined');
            });

            it('"title" and "content" are be empty strings', function() {
                expect(note.get('title')).to.be.equal('');
                expect(note.get('content')).to.be.equal('');
            });

            it('"notebookId" is equal to "0"', function() {
                expect(note.get('notebookId') === '0').to.be.equal(true);
            });

            it('should be equal to 0', function() {
                _.each(['taskAll', 'taskCompleted', 'created', 'updated', 'isFavorite', 'trash'], function(prop) {
                    expect(note.get(prop)).to.be.equal(0);
                });
            });

            it('type of these properties must be equal to "object"', function() {
                expect(typeof note.get('tags')).to.be.equal('object');
                expect(typeof note.get('files')).to.be.equal('object');
            });

        });

        describe('can change it\'s values', function() {

            it('it can change "title" property', function() {
                note.set('title', 'New title');
                expect(note.get('title')).to.be.equal('New title');
            });

            it('it can change "content" property', function() {
                note.set('content', 'New content');
                expect(note.get('content')).to.be.equal('New content');
            });

        });

        describe('validate()', function() {

            it('"title" shouldn\'t be empty', function() {
                expect(note.validate({title: ''}).length > 0).to.be.equal(true);
                expect(_.indexOf(note.validate({title: ''}), 'title') > -1).to.be.equal(true);
            });

            it('doesn\'t validate if "trash" is equal to 2', function() {
                expect(note.validate({title: '', trash: 2})).to.be.equal(undefined);
                expect(typeof note.validate({title: '', trash: 2})).not.to.be.equal('object');
            });

        });

        describe('toggleFavorite()', function() {

            it('toggles favourite status', function() {
                note.set('isFavorite', 0);
                expect(note.toggleFavorite().isFavorite).to.be.equal(1);

                note.set('isFavorite', 1);
                expect(note.toggleFavorite().isFavorite).to.be.equal(0);
            });

        });

        describe('setEscape()', function() {
            var data;

            beforeEach(function() {
                data = {
                    title   : '<script>alert("yes")</script>',
                    content : '<b href="javascript:alert(1)" title="javascript:alert(2)"></b>\n'
                };
            });

            it('sanitizes data to prevent XSS', function() {
                note.setEscape(_.extend({}, data));

                _.each(['title', 'content'], function(name) {
                    expect(note.get(name)).to.be.equal(_.cleanXSS(data[name]));
                    expect(note.get(name).search(data[name]) === -1).to.be.equal(true);
                });
            });

            it('does not escape characters over and over', function() {
                var sData     = _.extend({}, data);

                for (var i = 0; i < 10; i++) {
                    sData.title   = _.cleanXSS(sData.title);
                    sData.content = _.cleanXSS(sData.content);
                }

                note.setEscape(sData);

                _.each(['title', 'content'], function(name) {
                    expect(note.get(name)).to.be.equal(_.cleanXSS(data[name]));
                    expect(note.get(name).search(data[name]) === -1).to.be.equal(true);
                });
            });

        });

    });

});
