/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules/linkDialog/views/dialog',
    'modules/linkDialog/views/collection'
], function(_, Marionette, Radio, Layout, View) {
    'use strict';

    /**
     * Link dialog controller
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            _.bindAll(this, 'renderDropdown');
            this.options = options;

            // Instantiate and show the view
            this.layout = new Layout();
            Radio.request('global', 'region:show', 'modal', this.layout);

            // Prefetch notes
            this.wait = Radio.request('notes', 'fetch', {
                pageSize : 10,
                profile  : Radio.request('uri', 'profile')
            })
            .then(this.renderDropdown);

            // Events
            this.listenTo(this.layout, 'save', this.link);
            this.listenTo(this.layout, 'redirect', this.destroy);
            this.listenTo(this.layout, 'search', this.search);
            this.listenTo(this.layout, 'create:note', this.createNote);
        },

        onDestroy: function() {
            if (this.options.callback) {
                this.options.callback(null);
            }

            this.stopListening();
            Radio.request('global', 'region:empty', 'modal');
        },

        renderDropdown: function(notes) {
            this.wait  = null;
            this.notes = notes;

            this.view = new View({
                collection: notes
            });
            this.layout.notes.show(this.view);
        },

        /**
         * Provide the url to editor callback
         */
        link: function(url) {
            url  = typeof url === 'string' ? url : this.layout.ui.url.val().trim();
            this.options.callback(url !== '' ? url : null);

            // Close the dialog
            this.options.callback = null;
            this.destroy();
        },

        /**
         * Search notes
         */
        search: function(text) {
            // Notes have not been fetched yet
            if (this.wait) {
                return this.wait.then(_.bind(function() {
                    return this.search(text);
                }, this));
            }

            this.notes.reset(this.notes.fuzzySearch(text));
            this.layout.trigger('dropdown:toggle', this.notes.length);
        },

        /**
         * Create a new note
         */
        createNote: function() {
            var title = this.layout.ui.url.val().trim(),
                when  = Radio.request('notes', 'get:model', {
                    profile: Radio.request('uri', 'profile')
                });

            when.then(function(model) {
                return Radio.request('notes', 'save', model, {title: title});
            })
            .then(_.bind(function(model) {
                this.link('#' + Radio.request('uri', 'link', {}, model));
            }, this));
        },

    });

    return Controller;
});
