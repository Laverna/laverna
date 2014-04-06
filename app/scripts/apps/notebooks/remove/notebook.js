/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notebooks',
    'models/notebook'
], function (_, App, Marionette, Collection, Model) {
    'use strict';

    var Notebook = App.module('AppNotebooks.RemoveNotebook');

    Notebook.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'start', 'remove');

            this.collection = new Collection();
        },

        start: function (args) {
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
            App.navigate('#/notebooks');
        }
    });

    return Notebook.Controller;
});
