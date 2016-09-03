/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, RemoteStorage */
define([
    'tv4',
    'backbone.radio',
    'remotestorage'
], function(tv4, Radio) {
    'use strict';

    // Make TV4 globally available because RemoteStorage needs it.
    window.tv4 = tv4;
    var RS = new RemoteStorage({
        logging            : false,
        cordovaRedirectUri : 'https://laverna.cc',
        changeEvents : {
            local    : false,
            window   : false,
            remote   : true,
            conflict : true
        }
    });


    /**
     * Sometimes hash is not saved automatically after starting Backbone router.
     */
    var md = Radio.request('global', 'hash:original');
    md = md.match(/access_token=([^&]+)/);
    if (md && !RS.remote.token) {
        RS.remote.configure({
            token: md[1]
        });
    }

    // Make remoteStorage globally available
    window.remoteStorage = RS;
    return window.remoteStorage;
});
