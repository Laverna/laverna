/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'collections/configs',
    'apps/help/show/view'
], function (_, App, Marionette, URI, Configs, View) {
    'use strict';

    var Show = App.module('AppHelp.Show');

    Show.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show');
        },

        onDestroy: function () {
            this.view.trigger('destroy');
            delete this.view;
        },

        show: function () {
            var collection = new Configs();

            // We don't have to fetch settings because they are already in memory
            collection.resetFromJSON(App.settings);
            collection.reset(collection.shortcuts());

            this.view = new View({ collection: collection });
            App.modal.show(this.view);

            this.view.on('redirect', this.redirect, this);
        },

        redirect: function () {
            App.vent.trigger('navigate:back', '/notes');
        }

    });

    return Show.Controller;
});
