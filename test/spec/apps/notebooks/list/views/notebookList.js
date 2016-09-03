/* global chai, define, describe, before, it */
define([
    'marionette',
    'models/notebook',
    'collections/notebooks',
    'apps/notebooks/list/views/notebooksItem',
    'apps/notebooks/list/views/notebooksComposite'
], function(Marionette, Notebook, Notebooks, ItemView, ListView) {
    'use strict';

    var expect = chai.expect;

    // Fragments don't work properly in PhantomJS
    if (!document.createDocumentFragment().getElementById) {
        ListView.prototype.showCollection = function() {
            var frag = document.createDocumentFragment(),
                fake = {
                    appendChild: function(el) {
                        return frag.appendChild(el);
                    },
                    getElementById: function(ar) {
                        return frag.querySelector('#' + ar);
                    },
                };

            Marionette.CompositeView.prototype.showCollection.apply(this, arguments);
            this.children.each(function(view) {
                this.attachFragment(this, view, fake);
            }, this);
            this.$(this.childViewContainer).append(frag);
        };
    }

    describe('NotebooksItem view', function() {
        var notebook,
            view;

        before(function() {
            notebook = new Notebook({
                id  : '1',
                name: 'This is notebook name'
            });

            view = new ItemView({
                el: $('<div>'),
                model: notebook
            });

            view.render();
        });

        describe('instantiated', function() {
            it('should exist', function() {
                expect(view instanceof ItemView).to.be.equal(true);
            });

            it('model was passed', function() {
                expect(view.model).to.be.equal(notebook);
            });
        });

        describe('render()', function() {
            it('is not empty', function() {
                expect(view.$el.html() !== '').to.be.equal(true);
            });

            it('model', function() {
                var regx = new RegExp(notebook.get('name'), 'gi');
                expect(regx.test(view.$el.html())).to.be.equal(true);
            });

            it('makes itself active after `focus` event', function(done) {
                notebook.once('focus', function() {
                    var $item = view.$('.list-group-item[data-id=' + notebook.get('id') + ']');
                    expect($item.hasClass('active')).to.be.equal(true);
                    done();
                });
                notebook.trigger('focus');
            });
        });

    });

    describe('NotebooksComposite view', function() {
        var collection,
            view,
            models = [];

        before(function() {

            for (var i = 1; i <= 2; i++) {
                models.push({
                    id: 'notebook-' + i.toString(),
                    name: 'Notebook #' + i.toString(),
                    parentId: 'notebook-' + (i.toString() - 1)
                });
            }

            collection = new Notebooks(models);

            // Instantiate a CompositeView
            view = new ListView({
                el: $('<div>'),
                collection: collection
            });
            view.render();
        });

        describe('instantiated', function() {
            it('collection is not empty', function() {
                expect(view.collection.length).to.be.equal(models.length);
            });

            it('is was rendered', function() {
                expect(view.isRendered).to.be.equal(true);
                expect(view.$el.html() !== '').to.be.equal(true);
            });
        });

        describe('nested view', function() {

            it('items are nested', function() {
                var div,
                    id;

                for (var i = 0; i < collection.length; i++) {
                    id = collection.at(i).get('id');
                    div = view.$el.find('.list--nested[data-id=' + id + '] .list-group-item');
                    expect(div.length).to.be.equal(collection.length - 1 - i);
                }
            });

        });

        describe('behaviors', function() {
            it('has a behavior', function() {
                expect(view.behaviors.hasOwnProperty('CompositeBehavior')).to.be.equal(true);
            });
        });

    });
});
