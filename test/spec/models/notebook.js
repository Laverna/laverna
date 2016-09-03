/* global expect, define, describe, beforeEach, it */
define([
    'helpers/underscore-util',
    'models/notebook'
], function(_, Model) {
    'use strict';

    describe('models/notebook', function() {
        var notebook;

        beforeEach(function() {
            notebook = new Model();
        });

        describe('instance', function() {

            it('should be instance of Notebook Model', function() {
                expect(notebook).to.be.instanceof(Model);
            });

            it('converts `id` and `parentId` to string on start', function() {
                var n = new Model({id: 2, parentId: 1});
                expect(n.get('id')).to.be.a('string');
                expect(n.get('parentId')).to.be.a('string');
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

        describe('.validate()', function() {

            it('"name" shouldn\'t be empty', function() {
                expect(notebook.validate({name: ''}).length > 0).to.be.equal(true);
                expect(notebook.validate({name: ''})).to.contain('name');
            });

            it('doesn\'t validate if "trash" is equal to 2', function() {
                expect(notebook.validate({name: '', trash: 2})).to.be.equal(undefined);
                expect(notebook.validate({name: '', trash: 2})).not.to.be.an('object');
            });

            it('it can\'t have itself as parent', function(done) {
                notebook.once('invalid', function(m, error) {
                    expect(error).to.contain('parentId');
                    done();
                });
                notebook.set({id: '1', parentId: '1'});
                notebook.save();
            });

        });

        describe('.setEscape()', function() {

            it('sanitizes data to prevent XSS', function() {
                var data = {name: '<b href="javascript:alert(1)" title="javascript:alert(2)">Hello</b>\n'};
                notebook.setEscape(_.extend({}, data));

                expect(notebook.get('name')).to.be.equal(_.cleanXSS(data.name));
                expect(notebook.get('name')).not.to.contain(data.name);
            });

        });

    });

});
