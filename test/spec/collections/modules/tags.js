/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/tags',
    'collections/modules/module',
], function(sinon, Q, _, Radio, ColModule, Module) {
    'use strict';

    describe('collections/modules/tags', function() {
        var col,
            sandbox,
            stubSha;

        before(function() {
            col = new ColModule();
        });

        after(function() {
            col.destroy();
            Radio.stopReplying('encrypt', 'sha256');
        });

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            sandbox.stub(col, 'save').returns(Q.resolve());
            sandbox.stub(col, 'getModel').returns(Q.resolve());

            stubSha = sandbox.stub().returns('tag'.split(''));
            Radio.reply('encrypt', 'sha256', stubSha);
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('.initialize()', function() {

            it('has .Collection', function() {
                expect(col.Collection.prototype.storeName).to.be.equal('tags');
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

        describe('.addTags()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'addTag').returns(Q.resolve());
            });

            it('does nothing if tags array is empty', function() {
                return col.addTags([]).should.eventually.be.an('undefined');
            });

            it('adds all tags from array', function() {
                return col.addTags(['tag', 'tag2', 'tag3']).then(function() {
                    expect(col.addTag).callCount(3);
                });
            });

        });

        describe('.addTag()', function() {
            var model;

            before(function() {
                model = new col.Collection.prototype.model({id: 'test-id-tag'});
            });

            beforeEach(function() {
                sandbox.stub(col, 'saveModel');
            });

            it('requests sha256 salt of a tag', function() {
                col.addTag('tag');
                expect(stubSha).calledWith('tag');
            });

            it('will check if model with the same ID exists in database', function() {
                return col.addTag('tag', {}).then(function() {
                    expect(col.getModel).calledWithMatch({id: 'tag'});
                    expect(col.saveModel).calledWithMatch({}, {name: 'tag'});
                });
            });

            it('will save it if model exists but its name is empty', function() {
                col.getModel.returns(model);

                return col.addTag('tag', {}).then(function() {
                    expect(col.saveModel).calledWithMatch({}, {name: 'tag'});
                });
            });

            it('will not create a new model if a tag already exists', function() {
                model.set('name', 'tag-name');
                col.getModel.returns(model);
                return col.addTag('tag', {}).should.eventually.equal(model);
            });

        });

        describe('.saveModel()', function() {
            var model;

            beforeEach(function() {
                model = new col.Collection.prototype.model({id: 'test-id-1'});
                sandbox.stub(Module.prototype, 'saveModel');
            });

            it('throws an error if validation fails', function() {
                return col.saveModel(model, {name: ''}).should.be.rejected;
            });

            it('triggers `invalid` event on model', function(done) {
                model.once('invalid', function() { done(); });
                col.saveModel(model, {name: ''});
            });

            it('generates ID from SHA salted name of the tag to avoid duplicates', function() {
                col.saveModel(model, {name: 'testTag'});
                expect(stubSha).calledWith('testTag');
            });

            it('removes model if it has ID to avoid duplicates', function() {
                sandbox.stub(col, 'remove').returns(Q.resolve());

                return col.saveModel(model, {name: 'testTag'}).then(function() {
                    expect(col.remove).calledWith(model, {profile: model.profileId});
                });
            });

            it('calls the parent function to save changes', function() {
                return col.saveModel(model, {name: 'testTag'}).then(function() {
                    expect(Module.prototype.saveModel)
                        .calledWithMatch(model, {name: 'testTag'});
                });
            });

        });

    });

});
