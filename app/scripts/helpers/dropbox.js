/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'dropbox',
    'dropbox-backbone'
], function (_, App, Backbone, Dropbox, DropboxSync) {
    'use strict';

    var Adapter = function () { };

    Adapter = _.extend(Adapter.prototype, {

        // OAuth authentification
        // ---------------------
        auth: function () {
            var client = new Dropbox.Client({
                    key    : 'fql0agn2cbsap7g',
                    // secret : 'bv7r5h7c6joo1gv',
                    sandbox: true
                });

            client.authDriver(new Dropbox.AuthDriver.Popup({
                receiverUrl: 'http://localhost/ofnote/app/dropbox.html',
                rememberUser: true
            }));

            // Override backbone sync method
            Backbone.cloud = new DropboxSync(client);

            client.authenticate({interactive: false});

            if ( !client.isAuthenticated()) {
                client.authenticate();
            }
        }

    });

    return Adapter;
});
