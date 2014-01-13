/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'apps/notebooks/list/layout',
    'apps/notebooks/list/views/notebooksComposite',
    'apps/notebooks/list/views/tagsComposite',
    'collections/notebooks',
    'collections/tags'
], function (_, App, Marionette, Layout, NotebooksComposite, TagsComposite, Notebooks, Tags) {
    'use strict';

    var List = App.module('AppNotebook.List');

    List.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'list', 'show');

            // Collections of notebooks and tags
            this.notebooks = new Notebooks();
            this.tags = new Tags();

            // Synchronize
            this.notebooks.syncWithCloud();

            // After notebooks synchronize tags
            this.notebooks.on('sync:after', function () {
                this.tags.syncWithCloud();
            }, this);
        },

        list: function () {
            $.when(this.notebooks.fetch(), this.tags.fetch()).done(this.show);
        },

        show: function () {
            var notebookView, tagsView;

            // Show layout
            this.layout = new Layout({ notebooks: this.notebooks.length, tags: this.tags.length});
            App.sidebar.show(this.layout);

            // Start search and sync events
            App.Search.start();
            App.SyncStatus.start();

            // Show notebooks list
            notebookView = new NotebooksComposite({
                collection: this.notebooks
            });

            // Show tags list
            tagsView = new TagsComposite({
                collection: this.tags
            });

            // Render lists in layout
            this.layout.notebooks.show(notebookView);
            this.layout.tags.show(tagsView);
        }

    });

    return List.Controller;
});
