/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'marionette',
    'apps/notebooks/list/layout',
    'apps/notebooks/list/views/notebooksComposite',
    'apps/notebooks/list/views/tagsComposite',
    'collections/notebooks',
    'collections/tags'
], function(_, $, App, Marionette, Layout, NotebooksComposite, TagsComposite, Notebooks, Tags) {
    'use strict';

    var List = App.module('AppNotebook.List');

    List.Controller = Marionette.Controller.extend({

        initialize: function() {
            _.bindAll(this, 'list', 'show');

            // Collections of notebooks and tags
            this.notebooks = new Notebooks([], {
                comparator: App.settings.sortnotebooks
            });
            this.tags = new Tags();
        },

        onDestroy: function() {
            this.layout.trigger('destroy');
        },

        list: function(args) {
            // Set profile
            this.notebooks.database.getDB(args.profile);
            this.tags.database.getDB(args.profile);

            $.when(this.notebooks.fetch(), this.tags.fetch()).done(this.show);
        },

        show: function() {
            var notebookView, tagsView;
            this.notebooks.models = this.notebooks.getTree();

            // Show layout
            this.layout = new Layout({
                settings: App.settings
            });

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

            // Change value of document.title
            App.setTitle('', $.t('Notebooks & Tags'));
            App.AppNavbar.trigger('titleChange', {
                filter: 'Notebooks & Tags'
            });

            this.layout.on('navigate', this.navigate, this);
        },

        navigate: function(uri) {
            App.vent.trigger('navigate', uri);
        }
    });

    return List.Controller;
});
