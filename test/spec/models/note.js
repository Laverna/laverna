/* global expect, define, describe, beforeEach, it */
define([
    'require',
    'helpers/underscore-util',
    'models/note'
], function(require, _, Note) {
    'use strict';

    describe('models/note', function() {
        var note;

        beforeEach(function() {
            note = new Note();
        });

        describe('instance', function() {

            it('should be instance of Note Model', function() {
                expect(note).to.be.instanceof(Note);
            });

        });

        describe('default values', function() {

            it('"id" is undefined', function() {
                expect(note.get('id')).to.be.an('undefined');
            });

            it('"title" and "content" are be empty strings', function() {
                expect(note.get('title')).to.be.equal('');
                expect(note.get('content')).to.be.equal('');
            });

            it('"notebookId" is equal to "0"', function() {
                expect(note.get('notebookId')).to.be.equal('0');
            });

            it('should be equal to 0', function() {
                _.each(['taskAll', 'taskCompleted', 'created', 'updated', 'isFavorite', 'trash'], function(prop) {
                    expect(note.get(prop)).to.be.equal(0);
                });
            });

            it('tags and files are arrays', function() {
                expect(note.get('tags')).to.be.an('array');
                expect(note.get('files')).to.be.an('array');
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

        describe('.validate()', function() {

            it('"title" shouldn\'t be empty', function() {
                expect(note.validate({title: ''}).length > 0).to.be.equal(true);
                expect(note.validate({title: ''})).to.include.members(['title']);
            });

            it('doesn\'t validate if "trash" is equal to 2', function() {
                expect(note.validate({title: '', trash: 2})).to.be.equal(undefined);
                expect(note.validate({title: '', trash: 2})).not.to.be.an('object');
            });

        });

        describe('.toggleFavorite()', function() {

            it('toggles favorite status', function() {
                note.set('isFavorite', 0);
                expect(note.toggleFavorite().isFavorite).to.be.equal(1);

                note.set('isFavorite', 1);
                expect(note.toggleFavorite().isFavorite).to.be.equal(0);
            });

        });

        describe('.setEscape()', function() {
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
                    expect(note.get(name)).not.to.contain(data[name]);
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
                    expect(note.get(name)).not.to.contain(data[name]);
                });
            });

        });

    });

});
