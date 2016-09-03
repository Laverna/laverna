/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/notebooks',
    'collections/modules/module',
], function(sinon, Q, _, Radio, ColModule, Module) {
    'use strict';

    describe('collections/modules/notebooks', function() {
        var col,
            sandbox,
            collection;

        before(function() {
            col = new ColModule();

            collection = [];
            for (var i = 0; i < 10; i++) {
                collection.push({id: 'id-' + i});
            }
            collection = new col.Collection(collection);
        });

        after(function() {
            col.destroy();
        });

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            sandbox.stub(col, 'save').returns(Q.resolve());
            sandbox.stub(col, 'getModel').returns(Q.resolve());
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('.initialize()', function() {

            it('has .Collection', function() {
                expect(col.Collection.prototype.storeName).to.be.equal('notebooks');
            });

            it('listens on `.Collection.storeName` channel', function() {
                expect(col.vent).to.be.an('object');
                expect(col.vent.channelName).to.be.equal(col.Collection.prototype.storeName);
            });

            it('listens to requests', function() {
                _.each(_.union(Module.prototype.reply(), col.reply()), function(reply) {
                    expect(col.vent._requests[reply]).to.be.an('object');
                });
            });

        });

        describe('.remove()', function() {
            var model,
                notesStub;

            beforeEach(function() {
                model = new col.Collection.prototype.model({id: 'test-id-1'});

                sandbox.stub(col, 'updateChildren').returns(Q.resolve());
                sandbox.stub(Module.prototype, 'remove');

                notesStub = sandbox.stub().returns(Q.resolve([]));
                Radio.reply('notes', 'change:notebookId', notesStub);
            });

            after(function() {
                Radio.stopReplying('notes', 'change:notebookId');
            });

            it('tries to fetch model from database if the first argument is ID', function() {
                col.remove('test-id', {profile: 'test1'});
                expect(col.getModel).calledWith({id: 'test-id', profile: 'test1'});
            });

            it('calls .updateChildren()', function() {
                return col.remove(model, {profile: 'test1'}).then(function() {
                    expect(col.updateChildren).calledWithMatch(model);
                });
            });

            it('makes `change:notebookId` request on `notes` channel', function() {
                return col.remove(model, {profile: 'test1'}, true).then(function() {
                    expect(notesStub).calledWith(model, true);
                });
            });

            it('calls parent function', function() {
                return col.remove(model, {profile: 'test1'}, true).then(function() {
                    expect(Module.prototype.remove).calledWith(model, {profile: 'test1'});
                });
            });

        });

        describe('.updateChildren()', function() {
            var model;

            beforeEach(function() {
                model = new col.Collection.prototype.model({
                    id       : 'test-id-1',
                    parentId : 'test-id-0'
                });

                sandbox.stub(col, 'getChildren').returns(Q.resolve(new col.Collection()));
                sandbox.stub(col, 'saveModel').returns(Q.resolve());
            });

            it('calls .getChildren()', function() {
                col.updateChildren(model);
                expect(col.getChildren).calledWith(model.id, {profile: model.profileId});
            });

            it('updates parentId of each child notebook', function() {
                col.getChildren.returns(Q.resolve(collection));
                return col.updateChildren(model).then(function() {
                    expect(col.saveModel).callCount(collection.length);
                    expect(col.saveModel).calledWithMatch({}, {parentId: model.get('parentId')});
                });
            });

        });

        describe('.getChildren()', function() {

            it('uses this.collection if it exists', function() {
                col.collection = collection;
                sandbox.spy(collection, 'clone');

                col.getChildren('test-id-1', {});
                expect(collection.clone).called;
                col.collection = null;
            });

            it('fetches all child notebooks', function() {
                sandbox.stub(col, 'fetch');
                col.getChildren('test-id-1', {profile: 'test'});
                expect(col.fetch).calledWith({
                    conditions : {parentId : 'test-id-1'},
                    profile    : 'test'
                });
            });

        });

        describe('.getAll()', function() {

            beforeEach(function() {
                sandbox.stub(Module.prototype, 'getAll').returns(Q.resolve());
            });

            it('requests sorting direction configs', function() {
                var stub = sandbox.stub().returns('');
                Radio.replyOnce('configs', 'get:config', stub);

                col.getAll({});
                expect(stub).called;
            });

            it('returns current cached collection if it exists', function() {
                col.collection = collection;
                col.collection.profileId = 'testDb';

                return col.getAll({profile: 'testDb'}).should.eventually
                    .be.equal(collection);
            });

            it('calls the parent function otherwise', function() {
                col.collection = null;
                col.getAll({profile: 'testDb', filter: 'task'});
                expect(Module.prototype.getAll).calledWith({profile: 'testDb', filter: 'task'});
            });

        });

    });

});
