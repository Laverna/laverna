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

    var Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'list', 'show');
        },
        
        list: function () {
            this.notebooks = new Notebooks();
            this.tags = new Tags();

            $.when(this.notebooks.fetch(), this.tags.fetch()).done(this.show);
        },

        show: function () {
            this.layout = new Layout({
                notebooks: this.notebooks,
                tags: this.tags
            });

            App.sidebar.show(this.layout);

            this.layout.notebooks.show(new NotebooksComposite({
                collection: this.notebooks
            }));

            this.layout.tags.show(new TagsComposite({
                collection: this.tags
            }));

            this.layout.on('nextChild', this.toNextChild, this);
            this.layout.on('prevChild', this.toPrevChild, this);
        }
    });

    return Controller;
});
