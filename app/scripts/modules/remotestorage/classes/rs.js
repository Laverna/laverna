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
