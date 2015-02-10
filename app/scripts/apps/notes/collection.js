/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'marionette',
    'collections/notes'
], function(_, $, App, Marionette, Notes) {
    'use strict';

    var Collection = App.module('AppNote.Collection', {startWithParent: true}),
        Controller;

    /**
     * Controller
     */
    Controller = Marionette.Controller.extend({
        initialize: function() {
            this.collection = new Notes();
        },

        _getNotes: function(fnc) {
            if (this.collection.length) {
                return fnc(this.collection);
            }
            this.collection.on('reset', fnc);
            this.collection.fetch({reset: true});
        },

        getAll: function() {
            var defer = $.Deferred();
            this._getNotes(defer.resolve);
            return defer.promise();
        },

        getById: function(id) {
            var defer = $.Deferred();

            this._getNotes(function(notes) {
                defer.resolve( notes.get({id: id}) );
            });

            return defer.promise();
        },

        filter: function(condition) {
            var defer = $.Deferred();

            this._getNotes(function(notes) {
                notes = notes.where(condition);
                defer.resolve(notes);
            });

            return defer.promise();
        },
    });

    Collection.addInitializer(function() {
        var contr = new Controller();
        Collection.controller = contr;

        App.channel.reply('notes:all', contr.getAll, contr);
    });

    Collection.addFinalizer(function() {
        App.channel.stopReplying('notes:all');

        Collection.controller.destroy();
        delete Collection.controller;
    });

    return Collection;
});
