/* global chai, define, describe, before, it, Mousetrap */
define([
    'underscore',
    'backbone.radio',
    'collections/configs',
    'apps/notebooks/list/views/layout',
    'apps/notebooks/list/views/notebooksComposite',
    'apps/notebooks/list/views/tagsComposite',
    'collections/notebooks',
    'collections/tags',
    'mousetrap'
], function(_, Radio, Configs, Layout, NotebooksComp, TagsComp, Notebooks, Tags) {
    'use strict';

    var expect = chai.expect;

    describe('NotebookLayout view', function() {
        var layout,
            notebookView,
            tagsView,
            notebooks,
            tags;

        before(function() {

            notebooks = new Notebooks([{id: '1', name: 'Test'}]);
            tags = new Tags([{id: '1', name: 'Test'}]);

            // Show layout
            layout = new Layout({
                configs   : Configs.prototype.configNames,
                notebooks : notebooks,
                tags      : tags
            });
            layout.render();

            // Show notebooks list
            notebookView = new NotebooksComp({
                collection: notebooks
            });

            // Show tags list
            tagsView = new TagsComp({
                collection: tags
            });

            // Render lists in layout
            layout.notebooks.show(notebookView);
            layout.tags.show(tagsView);
        });

        describe('Keybindings', function() {

            it('triggers "navigate:next" event on "j" key', function(done) {
                layout[layout.activeRegion].currentView
                    .once('navigate:next', done);

                Mousetrap.trigger('j');
            });

            it('triggers "navigate:previous" event on "k" key', function(done) {
                layout[layout.activeRegion].currentView
                    .once('navigate:previous', done);

                Mousetrap.trigger('k');
            });

            it('"o", opens active element', function(done) {
                Radio.replyOnce('uri', 'navigate', function(url) {
                    var $a = layout.$('.list-group-item.active');
                    expect($a.length !== 0).to.be.equal(true);
                    expect(url).to.be.equal($a.attr('href'));
                    done();
                });

                layout.$('.list-group-item:first').addClass('active');
                Mousetrap.trigger('o');
            });

            it('"e" redirects to edit page', function(done) {
                Radio.replyOnce('uri', 'navigate', function(url) {
                    var $a = layout.$('.list-group-item.active').parent().find('.edit-link:first');

                    expect($a.length !== 0).to.be.equal(true);

                    expect(url).to.be.equal($a.attr('href'));
                    done();
                });

                layout.$('.list-group-item:first').addClass('active');
                Mousetrap.trigger('e');
            });

        });

    });
});
