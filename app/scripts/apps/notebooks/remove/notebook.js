/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'collections/notebooks',
    'models/notebook'
], function (_, App, Marionette, URI, Collection, Model) {
    'use strict';

    var Notebook = App.module('AppNotebooks.RemoveNotebook');

    Notebook.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'start', 'remove');

            this.collection = new Collection();
        },

        start: function (args) {
            // Set profile
            this.collection.database.getDB(args.profile);

            args.id = parseInt(args.id);

            this.model = new Model({id: parseInt(args.id)});

            $.when(
                this.collection.fetch({
                    conditions: {parentId: args.id}
                }),
                this.model.fetch()
            ).done(this.remove);
        },

        remove: function () {
            this.collection.each(function (child) {
                child.save({parentId : 0});
            });

            this.model.destroy();
            this.collection.syncDirty(this.model);
            this.redirect();
        },

        redirect: function () {
            App.navigate('#' + URI.link('/notebooks'));
        }
    });

    return Notebook.Controller;
});
