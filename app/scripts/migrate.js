/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global requirejs */
requirejs.config({
    paths: {
        q           : '../bower_components/q/q',
        underscore  : '../bower_components/underscore/underscore',
        localforage : '../bower_components/localforage/dist/localforage',
        sjcl        : '../bower_components/sjcl/sjcl',
    }
});

requirejs(['helpers/migrate'], function(Migrate) {
    'use strict';

    new Migrate().init()
    .then(function() {
        document.location.href = document.location.href.toString().replace('migrate.html', '');
    })
    .fail(function(e) {
        console.error('Migrate Error:', e);
    });
});
