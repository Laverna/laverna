/* global chai, define, describe, beforeEach, it */
'use strict';
define([
    'underscore',
    'models/notebook'
], function (_, Model) {

    var expect = chai.expect;

    describe('Notebook Model', function () {
        var notebook;

        beforeEach(function () {
            notebook = new Model();
        });

        describe('instance', function () {
            it('should be instance of Notebook Model', function () {
                expect(notebook instanceof Model).to.be.equal(true);
            });
        });

        describe('default values', function () {

            it('is ok', function () {
                expect(notebook.get('id')).to.be.equal(undefined);
                expect(notebook.get('parentId')).to.be.equal('');
                expect(notebook.get('name')).to.be.equal('');
                expect(notebook.get('synchronized')).to.be.equal(0);
            });

        });

        describe('can change it\'s values', function () {

            it('it can change "name" property', function () {
                notebook.set('name', 'New notebook');
                expect(notebook.get('name')).to.be.equal('New notebook');
            });

            it('it can change "parentId" property', function () {
                notebook.set('parentId', '1');
                expect(notebook.get('parentId')).to.be.equal('1');
            });

        });

        describe('ParentId', function () {
            it('it can\'t have itself as parent', function (done) {
                notebook.on('invalid', function (m, error) {
                    expect(_.indexOf(error, 'parentId')).to.be.ok();
                    done();
                });
                notebook.set({id: '1', parentId: '1'});
                notebook.save();
            });
        });

    });

});
