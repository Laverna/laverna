/*jshint expr: true*/
/* global expect, define, describe, it, beforeEach, before */
define([
    'sinon',
    'underscore',
    'backbone.radio',
    'collections/notebooks'
], function(sinon, _, Radio, Collection) {
    'use strict';

    describe('collections/notebooks', function() {
        var collection,
            models;

        before(function() {
            models = [];
            for (var i = 0; i < 10; i++) {
                models.push({
                    id       : 'id-' + i,
                    name     : 'Notebook' + i,
                    parentId : (i < 5 && i !== 0 ? 'id-' + (i - 1) : '0'),
                    trash    : 0
                });
            }
        });

        beforeEach(function() {
            collection = new Collection(models);
        });

        describe('.sortItOut()', function() {

            beforeEach(function() {
                sinon.stub(collection, 'getTree').returns([collection.at(0)]);
            });

            it('calls .getTree()', function() {
                collection.sortItOut();
                expect(collection.getTree).to.have.been.called;
            });

            it('overwrites .models with what .getTree() returns', function() {
                collection.sortItOut();
                expect(collection.models.length).to.be.equal(1);
                expect(collection.models[0]).to.be.equal(collection.at(0));
            });

        });

        describe('.sortFullCollection()', function() {

            beforeEach(function() {
                sinon.stub(collection, 'sortItOut', function() {
                    this.models = [collection.at(0)];
                });
            });

            it('calls .sortItOut()', function() {
                collection.sortFullCollection();
                expect(collection.sortItOut).to.have.been.called;
            });

            it('resets the collection', function() {
                var spy = sinon.spy(collection, 'reset');
                collection.sortFullCollection();
                expect(spy).to.have.been.called;
            });

        });

        describe('._onAddItem()', function() {

            beforeEach(function() {
                sinon.stub(collection, 'sortFullCollection');
                sinon.stub(collection, '_navigateOnRemove');
            });

            it('removes a model from collection if it does not meet condition', function() {
                collection.conditionCurrent = {id: 'id-2'};
                collection._onAddItem(collection.at(0));

                expect(collection._navigateOnRemove).to.have.been
                    .calledWith(collection.at(0));
            });

            it('removes a model from collection if trash === 0', function() {
                collection.at(1).set('trash', 1);
                collection._onAddItem(collection.at(1));

                expect(collection._navigateOnRemove).to.have.been
                    .calledWith(collection.at(1));
            });

            it('if the model was found, it updates its attributes', function() {
                var model = collection.at(2).clone();
                model.set({name: 'Hello World'});

                expect(model.get('name')).not.to.be.equal(collection.at(2).get('name'));
                collection._onAddItem(model);
                expect(model.get('name')).to.be.equal('Hello World');
            });

            it('if the model was not found, it adds it to the collection', function() {
                var model = new Collection.prototype.model({name: 'Test', id: 'id-test-1'});

                expect(collection.get(model.id)).to.be.an('undefined');
                collection._onAddItem(model);
                expect(collection.get(model.id)).to.be.an('object');
            });

            it('triggers `model:navigate` event', function(done) {
                Radio.once('notebooks', 'model:navigate', function(model) {
                    expect(model).to.be.equal(collection.at(0));
                    done();
                });

                collection._onAddItem(collection.at(0));
            });

        });

        it('.rejectTree()', function() {
            for (var i = 0; i < 10; i++) {

                // 5 first models are linked in the mockup
                var l = (i < 5 ? (5 - i) : 1);

                expect(collection.rejectTree(collection.at(i).id).length)
                    .to.be.equal(collection.length - l);
            }
        });

        describe('.getTree()', function() {

            it('returns array', function() {
                expect(collection.getTree()).to.be.an('array');
            });

        });

        it('.getChildren()', function() {
            expect(collection.getChildren('id-0')).to.be.an('array');
            expect(collection.getChildren('id-0').length).to.be.equal(1);
            expect(collection.getChildren('id-1').length).to.be.equal(1);
        });

        it('.getRoots()', function() {
            expect(collection.getRoots()).to.be.an('array');
            expect(collection.getRoots().length).to.be.equal(collection.length - 4);
        });

    });

});
