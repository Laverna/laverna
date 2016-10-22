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
    'q',
    'marionette',
    'backbone.radio',
    'apps/notebooks/list/views/layout',
    'apps/notebooks/list/views/notebooksComposite',
    'apps/notebooks/list/views/tagsComposite'
], function(_, Q, Marionette, Radio, View, NotebooksView, TagsView) {
    'use strict';

    /**
     * List controller.
     *
     * Triggers:
     * 1. channel: `global`, event: `filter:change`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            _.bindAll(this, 'show');

            this.options = options;

            // Show the navbar and change document title
            Radio.request('navbar', 'start', {
                title  : 'Notebooks & tags',
                filter : 'notebook'
            });

            // Fetch
            Q.all([
                Radio.request('notebooks', 'get:all', options),
                Radio.request('tags', 'get:all', options)
            ]).spread(this.show)
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        onDestroy: function() {
            Radio.request('global', 'region:empty', 'sidebar');
        },

        show: function(notebooks, tags) {
            this.view = new View({
                notebooks : notebooks,
                tags      : tags,
                configs   : Radio.request('configs', 'get:object')
            });

            Radio.request('global', 'region:show', 'sidebar', this.view);

            // Show notebooks
            this.view.notebooks.show(new NotebooksView({
                collection: notebooks
            }));

            // Show tags
            this.view.tags.show(new TagsView({
                collection: tags
            }));
        }

    });

    return Controller;

});
