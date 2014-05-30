/* global define, describe, beforeEach, it */
define([
    'require',
    'chai',
    'models/note'
], function (require, chai, Note) {
    'use strict';

    // var assert = chai.assert,
    //     should = chai.should(),
    var    expect = chai.expect;

    describe('Note Model', function () {
        var note;

        beforeEach(function () {
            note = new Note();
        });

        describe('instance', function () {
            it('should be instance of Note Model', function () {
                expect(note instanceof Note).to.be.equal(true);
            });
        });

        describe('default values', function () {

            it('default value of "title" property should be empty', function () {
                expect(note.get('title')).to.be.equal('');
            });

            it('default values of these properties should be equal to "0"', function () {
                expect(note.get('isFavorite')).to.be.equal(0);
                expect(note.get('taskAll')).to.be.equal(0);
                expect(note.get('taskCompleted')).to.be.equal(0);
                expect(note.get('trash')).to.be.equal(0);
                expect(note.get('synchronized')).to.be.equal(0);
            });

            it('type of these properties must be equal to "number"', function () {
                expect(typeof note.get('isFavorite')).to.be.equal('number');
                expect(typeof note.get('taskAll')).to.be.equal('number');
                expect(typeof note.get('taskCompleted')).to.be.equal('number');
                expect(typeof note.get('trash')).to.be.equal('number');
                expect(typeof note.get('synchronized')).to.be.equal('number');
            });

            it('type of these properties must be equal to "object"', function () {
                expect(typeof note.get('tags')).to.be.equal('object');
                expect(typeof note.get('images')).to.be.equal('object');
            });

        });

        describe('can change it\'s values', function () {

            it('it can change "title" property', function () {
                note.set('title', 'New title');
                expect(note.get('title')).to.be.equal('New title');
            });

            it('it can change "content" property', function () {
                note.set('content', 'New content');
                expect(note.get('content')).to.be.equal('New content');
            });

        });

    });

});
