/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'jquery',
    'backbone',
    'migrations/note',
    'models/removed',
], function ($, Backbone, NotesDB, Removed) {
    'use strict';

    /**
     * Collection of IDs of removed objects
     * We use this collection for synchronizing purposes
     */
    var RemovedObjects = Backbone.Collection.extend({

        model: Removed,

        database: NotesDB,
        storeName: 'removed',

        getID: function (model) {
            return this.get(model.storeName + '/' + model.id);
        },

        /**
         * Returns filtered collection of IDs
         */
        filterIt: function (object) {
            var store;
            return this.filter(function (model) {
                store = model.id.split('/');
                return store[0] === object.storeName;
            });
        },

        /**
         * Stores id of a model, then destroys it
         */
        newObject: function (object, options) {
            var done = $.Deferred(),
                model = this.create({
                    id: object.storeName + '/' + object.id
                });

            options = options || {};

            $.when(model.save(), object.destroy()).then(function () {
                done.resolve();
                if (typeof options.success === 'function') {
                    options.success(object);
                }
            }, function () {
                done.fail();
                if (typeof options.error === 'function') {
                    options.error(object);
                }
            });

            return model.save();
        }

    });

    return RemovedObjects;
});
