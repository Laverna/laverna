/*jshint expr: true*/
/* global expect, define, describe, beforeEach, before, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'backbone.radio',
    'collections/configs'
], function(sinon, Q, _, Radio, Collection) {
    'use strict';

    describe('collections/configs', function() {
        var collection;

        beforeEach(function() {
            collection = new Collection();
        });

        describe('.hasNewConfigs()', function() {

            it('.configNames length is not equal to .length', function() {
                expect(collection.hasNewConfigs()).to.be.equal(true);
            });

            it('.configNames length is equal to .length', function() {
                collection.configNames = {};
                expect(collection.hasNewConfigs()).to.be.equal(false);
            });

        });

        it('.changeDB()', function() {
            collection.changeDB('testP');
            expect(collection.profileId).to.be.equal('testP');
            expect(collection.model.prototype.profileId).to.be.equal('testP');
            collection.model.prototype.profileId = 'notes-db';
        });

        describe('.migrateFromLocal()', function() {

            before(function() {
                localStorage.setItem(
                    'vimarkable.configs-testingKey',
                    JSON.stringify({name: 'testingKey', value: 11})
                );
            });

            after(function() {
                localStorage.removeItem('vimarkable.configs-testingKey');
            });

            it('changes .configNames[key] if it exists in localStorage', function() {
                collection.configNames.testingKey = 10;

                collection.migrateFromLocal();
                expect(collection.configNames.testingKey).not.to.be.equal(10);
                expect(collection.configNames.testingKey).to.be.equal(11);
            });

            it('does nothing if it does not exist in localStorage', function() {
                collection.configNames.testingKey2 = 10;
                collection.migrateFromLocal();
                expect(collection.configNames.testingKey2).to.be.equal(10);
            });

        });

        describe('.createDefault()', function() {
            var sandbox;

            beforeEach(function() {
                sandbox = sinon.sandbox.create();

                sandbox.stub(collection.model.prototype, 'save', function() {
                    return Q.resolve();
                });
            });

            afterEach(function() {
                sandbox.restore();
            });

            it('returns a promise', function() {
                expect(collection.createDefault()).to.be.an('object');
                expect(collection.createDefault()).to.have.property('promiseDispatch');
            });

            it('creates new models', function() {
                collection.createDefault();
                expect(collection.model.prototype.save).to.have.been
                    .callCount(_.keys(collection.configNames).length);
            });

        });

        describe('.getConfigs()', function() {

            it('returns object', function() {
                expect(collection.getConfigs()).to.be.an('object');
            });

            it('converts current models into key=value', function() {
                collection.add([{name: 'test', value: 'test'}, {name: 'test2', value: 'test2'}]);
                var configs = collection.getConfigs();

                expect(_.keys(configs).length).to.be.equal(collection.length + 1);
                collection.each(function(model) {
                    expect(model.get('value')).to.be.equal(configs[model.get('name')]);
                });
            });

            it('parses .appProfiles', function() {
                collection.add({name: 'appProfiles', value: JSON.stringify(['notes-db'])});
                expect(collection.getConfigs().appProfiles).to.be.an('array');
            });

        });

        describe('.getDefault()', function() {

            it('returns a model', function() {
                expect(collection.getDefault('firstStart')).to.be.an('object');
                expect(collection.getDefault('firstStart').get('name')).to.be.equal('firstStart');
            });

            it('the value of the model is equal to default\'s', function() {
                expect(collection.getDefault('firstStart').get('value'))
                    .to.be.equal(collection.configNames.firstStart);
            });

        });

        describe('.resetFromJSON()', function() {

            it('creates models from an object', function() {
                collection.resetFromJSON({test: '1', test2: '2'});

                expect(collection.length).to.be.equal(2);
                expect(collection.get('test').get('value')).to.be.equal('1');
                expect(collection.get('test2').get('value')).to.be.equal('2');
            });

            it('resets the controller', function(done) {
                collection.once('reset', function() { done(); });
                collection.resetFromJSON({test: '1', test2: '2'});
            });

        });

        describe('.shortcuts()', function() {

            beforeEach(function() {
                collection.resetFromJSON(collection.configNames);
            });

            it('returns an array', function() {
                expect(collection.shortcuts()).to.be.an('array');
                expect(collection.shortcuts().length).to.be.equal(14);
            });

            it('filters the collection', function() {
                expect(collection.shortcuts().length).to.be.equal(14);
                expect(collection.shortcuts().length).not.to.be.equal(collection.length);
            });

        });

        it('.appShortcuts()', function() {
            collection.resetFromJSON(collection.configNames);
            expect(collection.appShortcuts()).to.be.an('array');
            expect(collection.appShortcuts().length).to.be.equal(3);
        });

        describe('.filterName()', function() {

            beforeEach(function() {
                collection.resetFromJSON(collection.configNames);
            });

            it('searches a string in models\' names', function() {
                expect(collection.filterName('action')).to.be.an('array');
                expect(collection.filterName('action').length).to.be.equal(4);
                expect(collection.filterName('navigate').length).to.be.equal(2);
                expect(collection.filterName('jump').length).to.be.equal(5);
            });

            it('performs case sensitive search', function() {
                expect(collection.filterName('edit').length).to.be.equal(1);
            });

        });

    });

});
