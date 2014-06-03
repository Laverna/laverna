/* global define, describe, beforeEach, before, it */
define([
    'underscore',
    'chai',
    'helpers/sync/remotestorage',
    'helpers/sync/dropbox',
    'helpers/sync/sync',
    'models/note',
    'models/notebook',
    'models/tag',
    'collections/tags'
], function (_, chai, RemoteSync, DropboxSync, Sync, Note, Notebook, Tag, Tags) {
    'use strict';

    var expect = chai.expect,
        syncTest = {};

    syncTest.getTestData = function (model) {
        var data;
        switch (model) {
            case Note.prototype.storeName:
                data = {
                    title: 'Hello world',
                    content: 'Random content'
                };
                break;
            case Notebook.prototype.storeName:
                data = { name: 'Hello notebook' };
                break;
            case Tag.prototype.storeName:
                data = { name: 'syncTestTag' };
                break;
        }
        return data;
    };

    /**
     * Test cloud storage adapters
     */
    syncTest.adapter = function (Model, syncStorage, storageName) {
        var data = syncTest.getTestData(Model.prototype.storeName),
            model,
            id;

        describe(Model.prototype.storeName + ' Model and ' + storageName, function () {

            this.timeout(15000);
            before(function () {
                Model.prototype.sync = syncStorage;
                model = new Model();
            });

            it('can use ' + storageName + ' as a sync adapter', function () {
                expect(model.sync === syncStorage).to.be.equal(true);
            });

            it('can save data to ' + storageName, function (done) {
                var keys = _.keys(data);
                model.save(data, {
                    success: function () {
                        // expect(typeof model.get('id')).to.be.equal('string');
                        expect(model.get(keys[0])).to.be.equal(data[keys[0]]);
                        done();
                    },
                    error: function (e) {
                        console.log(Model.prototype.storeName + ' error', e);
                    }
                });
            });

            it('can access to data from ' + storageName, function (done) {
                var modelNew = new Model({id: id});

                // Try to fetch data from RemoteStorage
                $.when(modelNew.fetch()).done(function () {
                    expect(modelNew.get('id')).to.be.equal(id);
                    done();
                });
            });

            it('can remove data from ' + storageName, function (done) {
                var modelNew = new Model({id: id});

                // Try to fetch data from RemoteStorage
                $.when(modelNew.destroy()).done(function () {
                    done();
                });
            });

        });
    };

    /**
     * Test synchronizing between IndexedDB and the cloud storage
     */
    syncTest.sync = function (Collection, syncStorage, syncName) {
        var data = syncTest.getTestData(Collection.prototype.storeName),
            sync,
            newModel,
            collectionCloud,
            collection;

        function uniqueData () {
            var keys = _.keys(data);
            data[keys[0]] = data[keys[0]] + ' ' + _.uniqueId();
            return data;
        }

        describe('Sync ' + Collection.prototype.storeName + ' collection', function () {
            this.timeout(35000);

            before(function () {

                collection = new Collection();
                sync = new Sync(syncName, collection);

                collectionCloud = new Collection();
                collectionCloud.sync = syncStorage;
            });

            beforeEach(function () { });

            function syncData (done) {
                $.when(sync.start()).then(function () {

                    $.when(collection.fetch(), collectionCloud.fetch()).then(function () {
                        console.log(collection.storeName, collection.length);
                        expect(collection.length === collectionCloud.length).to.be.equal(true);
                        done();
                    });

                });
            }

            it('is instance of Sync adapter', function () {
                expect(sync instanceof Sync).to.be.equal(true);
            });

            it('synchronizes data, if a new model created', function (done) {
                newModel = new collection.model(uniqueData());
                newModel.updateDate();

                $.when(newModel.save(data)).then(function () {
                    syncData(done);
                });
            });

            it('synchronizes data, if a model changed', function (done) {
                newModel.set(uniqueData());

                newModel.updateDate();
                $.when(newModel.save()).then(function () { syncData(done); });
            });

            it('synchronizes data, if a model removed', function (done) {
                newModel = new collection.model({id: newModel.id});
                $.when(newModel.destroy()).then(function () { syncData(done); });
            });

        });
    };

    /**
     * Test synchronizing with RemoteStorage
     */
    describe('Syncs data with RemoteStorage', function () {
        syncTest.sync(Tags, RemoteSync, 'RemoteStorage');
    });

    /**
     * Test synchronizing with Dropbox
     */
    describe('Syncs data with Dropbox', function () {
        // syncTest.sync(Tags, DropboxSync, 'Dropbox');
    });

    /**
     * Test RemoteStorage adapter
     */
    describe('RemoteStorage adapter', function () {
        syncTest.adapter(Note, RemoteSync, 'RemoteStorage');
        syncTest.adapter(Notebook, RemoteSync, 'RemoteStorage');
        syncTest.adapter(Tag, RemoteSync, 'RemoteStorage');
    });

    /**
     * Test Dropbox adapter
     */
    describe('Dropbox adapter', function () {
        // syncTest.adapter(Note, DropboxSync, 'Dropbox');
        // syncTest.adapter(Notebook, DropboxSync, 'Dropbox');
        // syncTest.adapter(Tag, DropboxSync, 'Dropbox');
    });

});
