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
            this.syncWithCloud(false);

            // Sync is completed - re render everything
            this.listenTo(this.notebooks, 'sync:after', this.fetchNotebooksSync);
            this.listenTo(this.tags, 'sync:after', this.fetchTagsSync);
        },

        syncWithCloud: function (forced) {
            // Synchronize notebooks
            this.notebooks.syncWithCloud(forced);

            // After notebooks synchronize tags
            this.notebooks.on('sync:after', function () {
                this.tags.syncWithCloud(forced);
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

            // View events
            App.AppNavbar.trigger('titleChange', {
                filter: 'Notebooks & Tags'
            });
            this.layout.on('syncWithCloud', this.syncWithCloud, this);
        },

        fetchNotebooksSync: function (notebooks) {
            if (this.isAnyNeedsToFetch(notebooks)) {
                this.notebooks.fetch();
            }
        },

        fetchTagsSync: function (tags) {
            if (this.isAnyNeedsToFetch(tags)) {
                this.tags.fetch();
            }
        },

        isAnyNeedsToFetch: function (objects) {
            if (objects.length === 0 || App.currentApp.moduleName !== 'AppNotebook') {
                return false;
            } else {
                return true;
            }
        }

    });

    return List.Controller;
});
