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
    Controller = Marionette.Object.extend({
        initialize: function() {
            this.collection = new Notes();
        },

        _getNotes: function(fnc, forceReset) {
            if (this.collection.length && !forceReset) {
                return fnc(this.collection);
            }
            this.collection.once('reset', fnc);
            this.collection.fetch({reset: true});
        },

        getAll: function() {
            var defer = $.Deferred();
            this._getNotes(defer.resolve, true);
            return defer.promise();
        },

        getById: function(id) {
            var defer = $.Deferred();

            this._getNotes(function(notes) {
                defer.resolve( notes.get({id: id}) );
            });

            return defer.promise();
        },

        filter: function(cond) {
            var defer = $.Deferred();

            this._getNotes(function(notes) {
                notes.filterList(cond.filter, cond.query);
                defer.resolve(notes);
            }, true);

            return defer.promise();
        }
    });

    Collection.on('before:start', function() {
        var contr = new Controller();
        Collection.controller = contr;

        App.channel.reply({
            'notes:all'    : contr.getAll,
            'notes:filter' : contr.filter
        }, contr);
    });

    Collection.on('before:stop', function() {
        App.channel.stopReplying('notes:all notes:filter');

        Collection.controller.destroy();
        delete Collection.controller;
    });

    return Collection;
});
