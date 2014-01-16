/*global define*/
define([
    'underscore',
    'backbone',
    'app',
    'migrations/note',
    'models/notebook',
    'indexedDB'
    // 'localStorage',
], function (_, Backbone, App, NotesDB, Notebook) {
    'use strict';

    /**
     * Notebooks collection
     */
    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        database: NotesDB,
        storeName: 'notebooks',

        /**
         * Generates the next order number
         */
        nextOrder: function () {
            if ( !this.length) {
                return 1;
            }
            return this.last().get('id') + 1;
        },

        /**
         * Finds notebooks childrens
         */
        getChildrens: function () {
            return this.filter(function (notebook) {
                return notebook.get('parentId') !== 0;
            });
        },

        /**
         * Only root notebooks
         */
        getRoots:  function () {
            return this.without.apply(this, this.getChildrens());
        },

        decrypt: function () {
            var data = this.toJSON();

            _.forEach(data, function (model) {
                model.name = App.Encryption.API.decrypt(model.name);
            });

            return data;
        },

        settingsEncrypt: function (configs, key) {
            self = this;
            this.forEach(function (model) {
                try {
                    JSON.parse(model.get('name'));
                } catch (e) {
                    model.save({
                        name: App.Encryption.API.encrypt(model.get('name'))
                    }, {
                        success: function () {
                            self.trigger('progressEncryption');
                        }
                    });
                }
            });
        },

        settingsDecrypt: function () {
            var self = this;
            return this.filter(function (model) {
                var state;
                try {
                    model.set({
                        name: App.Encryption.API.decrypt(model.get('name'))
                    }, {
                        success: function () {
                            self.trigger('progressEncryption');
                        }
                    });

                    state = true;
                } catch (e) {
                    state = false;
                } finally {
                    return state;
                }
            });
        }

    });

    return Notebooks;
});
