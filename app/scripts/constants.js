/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define(['underscore'], function (_) {
    'use strict';

    var constants = {};

    constants.VERSION = '0.7.51';
    constants.URL = location.origin + location.pathname.replace('index.html', '');

    // List of hosts and urls where default dropbox API will work
    constants.DEFAULTHOSTS = ['laverna.cc', 'laverna.github.io', 'localhost', 'localhost:9000', 'localhost:9100'];

    constants.DROPBOX_KEY = '10iirspliqts95d';
    constants.DROPBOX_SECRET = null;

    // Default Dropbox API key will not work
    if ( !_.contains(constants.DEFAULTHOSTS, location.host) ) {
        constants.DROPBOXKEYNEED = true;
    }

    return constants;
});
