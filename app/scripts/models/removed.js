/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'backbone',
    'migrations/note'
], function (Backbone, NotesDB) {
    'use strict';

    /**
     * Model stores id of removed objects
     */
    var Removed = Backbone.Model.extend({

        database: NotesDB,
        storeName: 'removed',

        defaults: {
            id: undefined
        }

    });

    return Removed;
});
