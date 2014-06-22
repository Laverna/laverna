/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'helpers/sync/sync'
], function (_, $, App, Sync) {
    'use strict';

    var instance = null;

    /**
     * Synchronizes data from collections with cloud storage
     */
    function SyncCollections () {
        this.cloudStorage = null;
        this.collections = null;
    }

    SyncCollections.prototype = {

        init: function (cloudStorage, collections) {
            var self = this,
                auth;

            if ( !cloudStorage ) {
                return;
            }

            App.trigger('sync:before');

            this.cloudStorage = cloudStorage;
            this.collections = collections;

            switch (this.cloudStorage) {
                case 'dropbox':
                    auth = this.dropboxAuth();
                    break;
                case 'remotestorage':
                    auth = this.remoteStorageAuth();
                    break;
            }

            $.when(auth).then(function () {

                $.when(self.sync()).then(function () {
                    App.log('SYNC DONE');
                    App.trigger('sync:after');
                }, function () {
                    App.log('SYNC error');
                });

            });
        },

        sync: function (index, done) {
            var self = this;

            index = index || 0;
            done = done || $.Deferred();

            if ( !this.collections[index]) {
                done.resolve();
            }
            else {
                $.when(this.syncCollection(this.collections[index])).then(function () {
                    self.sync((index + 1), done);
                });
            }

            return done;
        },

        syncCollection: function (collection) {
            var done = $.Deferred(),
                self = this,
                sync;

            require(['collections/' + collection], function (Collection) {

                collection = new Collection();
                sync = new Sync(self.cloudStorage, collection);

                $.when(sync.start()).then(function () {
                    App.log('Sync done: ' + Collection.prototype.storeName);
                    done.resolve();
                }, function (e) {
                    done.fail();
                    App.log(e);
                });

            });

            return done;
        },

        remoteStorageAuth: function () {
            var done = $.Deferred();

            require([
                'remotestorage',
                'helpers/sync/remotestorage'
            ], function (remoteStorage, remoteSync) {

                remoteStorage.displayWidget();
                $.when(remoteSync('auth')).then(function () {
                    done.resolve();
                });

            });

            return done;
        },

        dropboxAuth: function () {
            var done = $.Deferred();

            require(['helpers/sync/dropbox'], function (dropbox) {

                if (dropbox('auth', true)) {
                    done.resolve();
                }
                else {
                    App.Confirm.show({
                        content : 'Now you will be redirected to **Dropbox** authorization page.\r> Please click **OK** button.',
                        success : function () {
                            $.when(dropbox('auth')).then(function () {
                                done.resolve();
                            });
                        }
                    });
                }

            });

            return done;
        }

    };

    return function getSingleton () {
        return (instance = (instance || new SyncCollections()));
    };

});
