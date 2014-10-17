/* global chai, define, describe, before, it, Mousetrap */
define([
    'underscore',
    'collections/configs',
    'apps/notebooks/list/layout',
    'apps/notebooks/list/views/notebooksComposite',
    'apps/notebooks/list/views/tagsComposite',
    'collections/notebooks',
    'collections/tags',
    'Mousetrap'
], function(_, Configs, Layout, NotebooksComp, TagsComp, Notebooks, Tags) {
    'use strict';

    var expect = chai.expect;

    describe('NotebookLayout view', function() {
        var layout,
            notebookView,
            tagsView;

        before(function() {
            // Show layout
            layout = new Layout({
                settings: Configs.prototype.configNames
            });
            layout.render();

            // Show notebooks list
            notebookView = new NotebooksComp({
                collection: new Notebooks([{id: '1', name: 'Test'}])
            });

            // Show tags list
            tagsView = new TagsComp({
                collection: new Tags([{id: '1', name: 'Test'}])
            });

            // Render lists in layout
            layout.notebooks.show(notebookView);
            layout.tags.show(tagsView);
        });

        describe('Keybindings', function() {
            function listenNavigateOpen(done) {
                layout.once('navigate', function(url) {
                    var $a = layout.$('.list-group-item.active');
                    expect($a.length).to.be.ok();
                    expect(url).to.be.equal($a.attr('href'));
                    done();
                });
            }

            it('when user hits "Enter", opens active element', function(done) {
                listenNavigateOpen(done);
                notebookView.collection.at(0).trigger('active');
                Mousetrap.trigger('enter');
            });

            it('when user hits "o", opens active element', function(done) {
                listenNavigateOpen(done);
                Mousetrap.trigger('o');
            });

            it('when user hits "e", redirects to edit page', function(done) {
                layout.once('navigate', function(url) {
                    var $a = this.$('.list-group-item.active')
                        .parent()
                        .find('.edit-link');

                    expect($a.length).to.be.ok();
                    expect(url).to.be.equal($a.attr('href'));
                    done();
                });
                Mousetrap.trigger('e');
            });

            it('triggers "next" event when "j" was typed', function(done) {
                layout.notebooks.currentView
                .once(
                    'next',
                    function() {
                        done();
                    }
                );
                Mousetrap.trigger('j');
            });

            it('triggers "prev" event when "k" was typed', function(done) {
                layout.notebooks.currentView
                .once(
                    'prev',
                    function() {
                        done();
                    }
                );
                Mousetrap.trigger('k');
            });
        });

    });
});
