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
            Radio.command('navbar', 'start', {
                title  : 'Notebooks & Tags',
                filter : 'notebook'
            });

            // Fetch
            Q.all([
                Radio.request('notebooks', 'get:all', options),
                Radio.request('tags', 'get:all', options)
            ]).spread(this.show);
        },

        onDestroy: function() {
            Radio.command('global', 'region:empty', 'sidebar');
        },

        show: function(notebooks, tags) {
            this.view = new View({
                configs: Radio.request('configs', 'get:object')
            });

            Radio.command('global', 'region:show', 'sidebar', this.view);

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
