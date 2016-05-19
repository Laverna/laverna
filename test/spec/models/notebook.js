/* global chai, define, describe, beforeEach, it */
'use strict';
define([
    'underscore',
    'models/notebook'
], function(_, Model) {

    var expect = chai.expect;

    describe('Notebook Model', function() {
        var notebook;

        beforeEach(function() {
            notebook = new Model();
        });

        describe('instance', function() {
            it('should be instance of Notebook Model', function() {
                expect(notebook instanceof Model).to.be.equal(true);
            });
        });

        describe('default values', function() {
            it('id is undefined', function() {
                expect(notebook.get('id')).to.be.equal(undefined);
            });

            it('parentId is equal to "0"', function() {
                expect(notebook.get('parentId')).to.be.equal('0');
            });

            it('name is an empty string', function() {
                expect(notebook.get('name')).to.be.equal('');
            });

            it('is equal to 0', function() {
                _.each(['count', 'trash', 'created', 'updated'], function(name) {
                    expect(notebook.get(name)).to.be.equal(0);
                });
            });

        });

        describe('can change it\'s values', function() {

            it('it can change "name" property', function() {
                notebook.set('name', 'New notebook');
                expect(notebook.get('name')).to.be.equal('New notebook');
            });

            it('it can change "parentId" property', function() {
                notebook.set('parentId', '1');
                expect(notebook.get('parentId')).to.be.equal('1');
            });

        });

        describe('validate()', function() {

            it('"name" shouldn\'t be empty', function() {
                expect(notebook.validate({name: ''}).length > 0).to.be.equal(true);
                expect(_.indexOf(notebook.validate({name: ''}), 'name') > -1).to.be.equal(true);
            });

            it('doesn\'t validate if "trash" is equal to 2', function() {
                expect(notebook.validate({name: '', trash: 2})).to.be.equal(undefined);
                expect(typeof notebook.validate({name: '', trash: 2})).not.to.be.equal('object');
            });

            it('it can\'t have itself as parent', function(done) {
                notebook.on('invalid', function(m, error) {
                    expect(_.indexOf(error, 'parentId') !== -1).to.be.equal(true);
                    done();
                });
                notebook.set({id: '1', parentId: '1'});
                notebook.save();
            });

        });

    });

});
