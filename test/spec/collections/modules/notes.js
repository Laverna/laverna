/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/notes',
    'collections/modules/module',
], function(sinon, Q, _, Radio, ColModule, Module) {
    'use strict';

    describe('collections/modules/notes', function() {
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
                expect(col.Collection.prototype.storeName).to.be.equal('notes');
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

        describe('.reply()', function() {

            it('returns replies', function() {
                expect(col.reply()).to.be.an('object');
                expect(_.keys(col.reply()).length).to.be.equal(3);
            });

        });

        describe('.saveModel()', function() {

            beforeEach(function() {
                sandbox.stub(Module.prototype, 'saveModel');
            });

            it('will try to add tags', function(done) {
                Radio.replyOnce('tags', 'add', function(tags, options) {
                    expect(tags).to.deep.equal(['tag1', 'tag2']);
                    expect(options.profile).to.be.equal('test');
                    done();
                });
                col.saveModel({profileId: 'test'}, {tags: ['tag1', 'tag2']});
            });

            it('saves the model afterwards', function() {
                return col.saveModel({profileId: 'test'}, {tags: ['tag1']})
                .then(function() {
                    expect(Module.prototype.saveModel)
                        .calledWith({profileId: 'test'}, {tags: ['tag1']});
                });
            });

        });

        describe('.remove()', function() {
            var model;

            beforeEach(function() {
                model = new col.Collection.prototype.model();
            });

            it('tries to fetch model from database if only ID was provided', function() {
                col.remove('test-id', {profile: 'test1'});
                expect(col.getModel).calledWith('test-id', {profile: 'test1'});
            });

            it('removes the model instead of putting to trash if it is already there', function() {
                var stub = sandbox.stub(Module.prototype, 'remove');
                model.set('trash', 1);

                return col.remove(model, {profile: 'test1'})
                .then(function() {
                    expect(stub).to.be.calledWith(model, {profile: 'test1'});
                });
            });

            it('changes `trash` status to `1`', function() {
                return col.remove(model, {profile: 'test1'})
                .then(function() {
                    expect(col.save).calledWithMatch(model, {trash: 1});
                });
            });

            it('triggers `destroy:model` event', function(done) {
                col.vent.once('destroy:model', function() { done(); });
                col.remove(model, {profile: 'test1'});
            });

        });

        describe('.restore()', function() {
            var model;

            before(function() {
                model = new col.Collection.prototype.model({trash: 1});
            });

            it('tries to fetch model from database if only ID was provided', function() {
                col.restore('test-id-2', {profile: 'test2'});
                expect(col.getModel).calledWith('test-id-2', {profile: 'test2'});
            });

            it('changes `trash` status to `0`', function() {
                return col.restore(model, {profile: 'test2'})
                .then(function() {
                    expect(col.save).calledWithMatch(model, {trash: 0});
                });
            });

            it('triggers `restore:model` event', function(done) {
                col.vent.once('restore:model', function() { done(); });
                col.restore(model, {profile: 'test2'});
            });

        });

        describe('.onNotebookRemove()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'fetch').returns(Q.resolve(collection));
                sandbox.stub(col, 'saveModel').returns(Q.resolve());
            });

            it('fetches all notes which are attached to the notebook', function() {
                return col.onNotebookRemove({id: 'test-id-3', profileId: 'test3'})
                .then(function() {
                    expect(col.fetch).calledWith({
                        conditions: {notebookId: 'test-id-3'},
                        profile   : 'test3'
                    });
                });
            });

            it('changes notes\' notebookId to `0`', function() {
                return col.onNotebookRemove({id: 'test-id-3', profileId: 'test3'})
                .then(function() {
                    expect(col.saveModel).callCount(collection.length);
                    expect(col.saveModel).calledWithMatch({}, {notebookId: 0});
                });
            });

            it('changes notes\' trash status to `1` if remove argument is true', function() {
                return col.onNotebookRemove({id: 'test-id-3', profileId: 'test3'}, true)
                .then(function() {
                    expect(col.saveModel).callCount(collection.length);
                    expect(col.saveModel).calledWithMatch({}, {notebookId: 0, trash: 1});
                });
            });

            it('does nothing if no notes were found', function() {
                col.fetch.returns(Q.resolve([]));
                return col.onNotebookRemove({id: 'test-id-3'}).should.eventually
                    .be.equal(undefined);
            });

        });

        describe('.getAll()', function() {

            beforeEach(function() {
                sandbox.stub(Module.prototype, 'getAll').returns(Q.resolve(collection));
            });

            it('uses `active` filter if no filter is provided', function() {
                col.getAll({});
                expect(Module.prototype.getAll).calledWith({filter: 'active'});
            });

            it('calls ._filterOnFetch()', function() {
                sandbox.spy(col, '_filterOnFetch');
                return col.getAll({filter: 'task', query: 'hello'}).then(function() {
                    expect(col._filterOnFetch)
                        .calledWithMatch({}, {filter: 'task', query: 'hello'});
                });
            });

        });

        describe('._filterOnFetch()', function() {

            it('calls collection.filterList()', function() {
                var options = {filter: 'task', query: 'hello'};
                sandbox.spy(collection, 'filterList');

                col._filterOnFetch(collection, options);
                expect(collection.filterList).calledWith(options.filter, options);
            });

        });

        describe('.getModelFull()', function() {
            var model;

            beforeEach(function() {
                model = new col.Collection.prototype.model({
                    id         : 'test-id-4',
                    notebookId : 'test-notebook-id',
                    files      : ['file-id-1']
                });
                col.getModel.returns(Q.resolve(model));
            });

            it('fetches a model', function() {
                col.getModelFull({id: 'test-id-4'});
                expect(col.getModel).calledWith({id: 'test-id-4'});
            });

            it('requests the notebook attached to a note', function(done) {
                Radio.replyOnce('notebooks', 'get:model', function(data) {
                    expect(data.id).to.be.equal(model.get('notebookId'));
                    done();
                });

                col.getModelFull({id: 'test-id-4', profile: 'test-db'});
            });

            it('requests files attached to a note', function(done) {
                Radio.replyOnce('files', 'get:files', function(files) {
                    expect(files).to.be.equal(model.get('files'));
                    done();
                });

                col.getModelFull({id: 'test-id-4', profile: 'test-db'});
            });

        });

    });

});
