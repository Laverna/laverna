/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
    'collections/tags',
    'collections/notebooks',
    'apps/notes/form/formView'
], function (_, $, Radio, Marionette, Tags, Notebooks, View) {
    'use strict';

    /**
     * Note form controller.
     *
     * Triggers the following events:
     * 1. channel: notesForm, event: stop
     *
     * Listens to the following events:
     * 1. channel: notes, event: save:after
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            var self = this;
            this.options = options;

            _.bindAll(this, '_show', '_redirect');

            // Instantiate a few extra collections
            this.tags = new Tags();
            this.notebooks = new Notebooks();

            // Fetch everything
            Radio.request('notes', 'getById', options.id)
            .then(function(note) {
                self.note = note;
                return self.tags.fetch();
            })
            .then(this.notebooks.fetch())
            .then(this._show);

            // Events
            Radio.on('notes', 'save:after', this._redirect);
        },

        onDestroy: function() {
            Radio.off('notes', 'save:after');
            this.view.trigger('destroy');
        },

        _show: function() {
            this.view = new View({
                model     : this.note,
                profile   : this.note.database.id,
                tags      : this.tags,
                notebooks : this.notebooks,
                files     : [],
            });

            // Listen to view events
            this.view.on('cancel', this._redirect, this);

            // Show the view and trigger an event
            Radio.command('global', 'region:show', 'content', this.view);
            this.view.trigger('rendered');
        },

        _redirect: function() {
            if (!this.view.getOption('redirect')) {
                return;
            }

            // Stop the module and navigate back
            Radio.trigger('notesForm', 'stop');
            Radio.command('uri', 'back');
        }

    });

    return Controller;
});
