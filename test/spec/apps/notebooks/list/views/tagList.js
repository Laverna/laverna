/* global chai, define, describe, before, it */
define([
    'require',
    'jquery',
    'models/tag',
    'collections/tags',
    'apps/notebooks/list/views/tagsItem',
    'apps/notebooks/list/views/tagsComposite'
], function(require, $, Tag, Tags, ItemView, ListView) {
    'use strict';

    var expect = chai.expect;

    describe('TagsItem view', function() {
        var tag,
            view;

        before(function() {
            tag = new Tag({
                id  : '1',
                name: 'This is tag name'
            });

            view = new ItemView({
                el: $('<div>'),
                model: tag
            });

            view.render();
        });

        describe('instantiated', function() {
            it('should exist', function() {
                expect(view).to.be.ok();
            });

            it('model was passed', function() {
                expect(view.model).to.be.equal(tag);
            });
        });

        describe('render()', function() {
            it('is not empty', function() {
                expect(view.$el.html() !== '').to.be.ok();
            });

            it('model', function() {
                var regx = new RegExp(tag.get('name'), 'gi');
                expect(regx.test(view.$el.html())).to.be.ok();
            });

            it('makes itself active after event model:active', function(done) {
                tag.on('active', function() {
                    var $item = view.$('.list-group-item[data-id=' + tag.get('id') + ']');
                    expect($item).to.have.class('active');
                    done();
                });
                tag.trigger('active');
            });
        });
    });

    describe('TagsComposite view', function() {
        var collection,
            view,
            models = [];

        before(function() {

            for (var i = 1; i <= 10; i++) {
                models.push({
                    id: i.toString(),
                    name: 'tag #' + i.toString()
                });
            }

            collection = new Tags(models);

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
                        expect(region).to.be.equal('notebooks');
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
