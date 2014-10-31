/* global chai, define, describe, before, it */
define([
    'require',
    'jquery',
    'models/notebook',
    'collections/notebooks',
    'apps/notebooks/list/views/notebooksItem',
    'apps/notebooks/list/views/notebooksComposite'
], function(require, $, Notebook, Notebooks, ItemView, ListView) {
    'use strict';

    var expect = chai.expect;

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
                expect(view).to.be.ok();
            });

            it('model was passed', function() {
                expect(view.model).to.be.equal(notebook);
            });
        });

        describe('render()', function() {
            it('is not empty', function() {
                expect(view.$el.html() !== '').to.be.ok();
            });

            it('model', function() {
                var regx = new RegExp(notebook.get('name'), 'gi');
                expect(regx.test(view.$el.html())).to.be.ok();
            });

            it('makes itself active after event model:active', function(done) {
                notebook.on('active', function() {
                    var $item = view.$('.list-group-item[data-id=' + notebook.get('id') + ']');
                    expect($item).to.have.class('active');
                    done();
                });
                notebook.trigger('active');
            });
        });

    });

    describe('NotebooksComposite view', function() {
        var collection,
            view,
            models = [];

        before(function() {

            for (var i = 1; i <= 10; i++) {
                models.push({
                    id: i,
                    name: 'Notebook #' + i.toString(),
                    parentId: (i.toString() - 1)
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
                expect(view.collection.length).to.be.ok(models.length);
            });

            it('is was rendered', function() {
                expect(view.isRendered).to.be.ok();
                expect(view.$el.html() !== '').to.be.ok();
            });
        });

        describe('nested view', function() {
            it('items are nested', function() {
                var div,
                    id;

                for (var i = 0; i < collection.length; i++) {
                    id = collection.at(i).get('id');
                    div = view.$el.find('div.tags[data-id=' + id + '] .list-group-item');
                    expect(div.length).to.be.equal(collection.length - 1 - i);
                }
            });
        });

        describe('behaviors', function() {
            it('has a behavior', function() {
                expect(view.behaviors.hasOwnProperty('CompositeBehavior')).to.be.ok();
            });

            function testActive (model) {
                var item = view.$('[data-id=' + model.get('id') + ']');
                expect(item.length > 0).to.be.ok();
                expect(item).to.have.class('active');
            }

            function changeRegion (trigger) {
                it('triggers event :changeRegion when there are no objects left', function(done) {
                    view.once('changeRegion', function(region) {
                        expect(region).to.be.equal('tags');
                        done();
                    });
                    view.trigger(trigger);
                });
            }

            describe('navigation', function() {
                it('listens to "next" event', function(done) {
                    this.timeout(300 * collection.length);
                    collection.each(function(model, i) {
                        model.once('active', function() {
                            testActive(model);
                            if (i === collection.length - 1) {
                                done();
                            }
                        });
                        view.trigger('next');
                    });
                });

                changeRegion('next');

                it('listens to "prev" event', function(done) {
                    this.timeout(300 * collection.length);

                    $('.active', view.$el).removeClass('active');
                    collection.each(function(model, i) {
                        i = i + 1;
                        collection.at(collection.length - i).once('active', function() {
                            testActive(collection.at(collection.length - i));
                            if (collection.length - i === 0) {
                                done();
                            }
                        });
                        view.trigger('prev');
                    });
                });

                changeRegion('prev');
            });
        });
    });
});
