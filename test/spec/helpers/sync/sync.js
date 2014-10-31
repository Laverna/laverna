/* global chai, define, describe, beforeEach, before, it */
define([
    'underscore',
    'helpers/sync/remotestorage',
    'helpers/sync/dropbox',
    'helpers/sync/sync',
    'collections/notebooks',
    'collections/notes',
    'collections/tags',
    'collections/files'
], function (_, RemoteSync, DropboxSync, Sync, Notebooks, Notes, Tags, Files) {
    'use strict';

    var expect = chai.expect,
        syncTest = {};

    syncTest.getTestData = function (model) {
        var data;
        switch (model) {
        case Notes.prototype.storeName:
            data = {
                title: 'Hello world' + _.uniqueId(),
                content: 'Random content'
            };
            break;
        case Notebooks.prototype.storeName:
            data = { id: 1, name: 'Hello notebook' + _.uniqueId() };
            break;
        case Tags.prototype.storeName:
            data = { name: 'syncTestTag' + _.uniqueId() };
            break;
        case Files.prototype.storeName:
            data = {
                src: 'data:image/png;base64,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',
                type: 'image/png'
            };
            break;
        }
        return data;
    };

    /**
     * Test cloud storage adapters
     */
    syncTest.adapter = function (Model, syncStorage, storageName, timeout) {
        var data = syncTest.getTestData(Model.prototype.storeName),
            model,
            id;

        describe(Model.prototype.storeName + ' Model and ' + storageName, function () {

            this.timeout(timeout || 15000);
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

                $.when(modelNew.destroy()).done(function () {
                    done();
                });
            });

        });
    };

    /**
     * Test synchronizing between IndexedDB and the cloud storage
     */
    syncTest.sync = function (Collection, syncStorage, syncName, timeout) {
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
            this.timeout(timeout || 35000);

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
                $.when(newModel.destroySync()).then(function () { syncData(done); });
            });

        });
    };

    /**
     * Test synchronizing with RemoteStorage
     */
    describe('Syncs data with RemoteStorage', function () {
        syncTest.sync(Notes, RemoteSync, 'RemoteStorage');
        syncTest.sync(Notebooks, RemoteSync, 'RemoteStorage');
        syncTest.sync(Tags, RemoteSync, 'RemoteStorage');
        syncTest.sync(Files, RemoteSync, 'RemoteStorage');
    });

    /**
     * Test synchronizing with Dropbox
     */
    describe('Syncs data with Dropbox', function () {
        syncTest.sync(Notes, DropboxSync, 'Dropbox');
        syncTest.sync(Notebooks, DropboxSync, 'Dropbox');
        syncTest.sync(Tags, DropboxSync, 'Dropbox');
        syncTest.sync(Files, DropboxSync, 'Dropbox');
    });

    /**
     * Test RemoteStorage adapter
     */
    describe('RemoteStorage adapter', function () {
        // syncTest.adapter(Notes.prototype.model, RemoteSync, 'RemoteStorage');
        // syncTest.adapter(Notebooks.prototype.model, RemoteSync, 'RemoteStorage');
        // syncTest.adapter(Tags.prototype.model, RemoteSync, 'RemoteStorage');
    });

    /**
     * Test Dropbox adapter
     */
    describe('Dropbox adapter', function () {
        // syncTest.adapter(Notes.prototype.model, DropboxSync, 'Dropbox');
        // syncTest.adapter(Notebooks.prototype.model, DropboxSync, 'Dropbox');
        // syncTest.adapter(Tags.prototype.model, DropboxSync, 'Dropbox');
        // syncTest.adapter(Files.prototype.model, DropboxSync, 'Dropbox', 65000);
    });

});
