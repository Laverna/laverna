/*global define*/
define([
    'underscore',
    'app',
    'dropbox',
    'backbone',
    'dropbox-backbone',
], function (_, App, Dropbox, Backbone, DropboxSync) {
    'use strict';

    var Adapter = function () { };

    Adapter = _.extend(Adapter.prototype, {

        // OAuth authentification
        // ---------------------
        auth: function () {
            var client = new Dropbox.Client({
                key    : 'j4xpefzl2jmn142',
                secret : '0uy343fvb6dc4ch',
                sandbox: true
            });

            client.authDriver(new Dropbox.AuthDriver.Popup({
                receiverUrl: 'http://localhost/ofnote/app/dropbox.html',
                rememberUser: true
            }));

            // Override backbone sync method
            Backbone.cloud = new DropboxSync(client);

            client.authenticate({interactive: true}, function(error, clt) {
                if (error) {
                    App.log(error);
                }
                App.log(clt);
            });
        }

    });

    return Adapter.auth();
});
