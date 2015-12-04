/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/notebooks/list/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    /**
     * Notebooks list sub module.
     * It shows notebooks and tags list.
     */
    var List = App.module('AppNotebooks.List', {startWithParent: false});

    List.on('before:start', function(options) {
        List.controller = new Controller(options);
    });

    List.on('before:stop', function() {
        List.controller.destroy();
        List.controller = null;
    });

    return List;

});
