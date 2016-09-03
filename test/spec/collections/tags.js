/*jshint expr: true*/
/* global expect, define, describe, beforeEach, before, it */
define([
    'sinon',
    'underscore',
    'backbone.radio',
    'collections/tags'
], function(sinon, _, Radio, Collection) {
    'use strict';

    describe('collections/tags', function() {
        var collection,
            models;

        before(function() {
            models = [];
            for (var i = 0; i < 40; i++) {
                models.push({
                    id: 'id-' + i,
                    name: 'Tag ' + i,
                });
            }
        });

        beforeEach(function() {
            collection = new Collection(models);
            collection.fullCollection = collection.clone();
        });

        describe('._onAddItem()', function() {

            it('triggers `model:navigate` event', function(done) {
                Radio.once('tags', 'model:navigate', function(model) {
                    expect(model).to.be.equal(collection.at(0));
                    done();
                });

                collection._onAddItem(collection.at(0));
            });

        });

        describe('.sortFullCollection()', function() {

            it('does nothing if .fullCollection does not exist', function() {
                collection.fullCollection = undefined;
                expect(collection.sortFullCollection()).to.be.an('undefined');
            });

            it('sorts full collection', function() {
                var spy = sinon.spy(collection.fullCollection, 'sortItOut');
                collection.sortFullCollection();
                expect(spy).to.have.been.called;
            });

            it('updates pagination state', function() {
                var spy = sinon.spy(collection, '_updateTotalPages');
                collection.sortFullCollection();
                expect(spy).to.have.been.called;
            });

            it('resets the collection', function(done) {
                collection.once('reset', function() {
                    expect(collection.length).not.to.be.equal(models.length);
                    expect(collection.fullCollection.length).to.be.equal(models.length);
                    done();
                });

                collection.sortFullCollection();
            });

        });

        describe('.getPage()', function() {
            var firstModels;

            beforeEach(function(done) {
                firstModels = collection.models.slice(0, collection.state.pageSize);
                collection.once('reset', function() { done(); });
                collection.reset(firstModels);
            });

            it('gets offset number', function() {
                var spy = sinon.spy(collection, 'getOffset');
                collection.getPage(0);
                expect(spy).to.have.been.called;
            });

            it('saves the page number into .state', function() {
                collection.getPage(1);
                expect(collection.state.currentPage).to.be.equal(1);
            });

            it('adds more models if page number is not 0', function() {
                var spy = sinon.spy(collection, 'add');

                expect(collection.length).not.to.be.equal(models.length);
                collection.getPage(1);

                expect(collection.length).to.be.equal(2 * collection.state.pageSize);
                expect(spy).to.have.been.called;
            });

            it('resets the collection if page number is 0', function() {
                var spy = sinon.spy(collection, 'reset');
                collection.getPage(0);
                expect(spy).to.have.been.called;
            });

        });

        it('.hasPreviousPage()', function() {
            expect(collection.hasPreviousPage()).to.be.equal(false);
        });

    });
});
