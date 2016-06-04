/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/files',
    'collections/modules/module',
], function(sinon, Q, _, Radio, ColModule, Module) {
    'use strict';

    describe('collections/modules/files', function() {
        var col,
            sandbox;

        before(function() {
            col = new ColModule();
        });

        after(function() {
            col.destroy();
        });

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            sandbox.stub(col, 'save').returns(Q.resolve());
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('.initialize()', function() {

            it('has .Collection', function() {
                expect(col.Collection.prototype.storeName).to.be.equal('files');
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

        describe('.getFiles()', function() {
            var ids;

            before(function() {
                ids = [];
                for (var i = 0; i < 10; i++) {
                    ids.push('id' + i);
                }
            });

            beforeEach(function() {
                sandbox.stub(col, 'getModel').returns(Q.resolve());
            });

            it('will fetch all models with the provided IDs', function() {
                return col.getFiles(ids, {profile: 'test'}).then(function() {
                    expect(col.getModel).callCount(ids.length);
                    expect(col.getModel).calledWithMatch({profile: 'test'});
                });
            });

        });

        describe('.saveAll()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'saveModel').returns(Q.resolve());
            });

            it('saves all models', function() {
                var data = [{id: 1}, {id: 2}];
                return col.saveAll(data, {profile: 'test'}).then(function() {
                    expect(col.saveModel).callCount(data.length);
                    expect(col.saveModel).calledWithMatch({profileId: 'test'});
                });
            });

        });

    });

});
