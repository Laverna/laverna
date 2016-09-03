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
                expect(view instanceof ItemView).to.be.equal(true);
            });

            it('model was passed', function() {
                expect(view.model).to.be.equal(tag);
            });
        });

        describe('render()', function() {
            it('is not empty', function() {
                expect(view.$el.html() !== '').to.be.equal(true);
            });

            it('model', function() {
                var regx = new RegExp(tag.get('name'), 'gi');
                expect(regx.test(view.$el.html())).to.be.equal(true);
            });

            it('makes itself active after `focus` event', function(done) {
                tag.once('focus', function() {
                    var $item = view.$('.list-group-item[data-id=' + tag.get('id') + ']');
                    expect($item.hasClass('active')).to.be.equal(true);
                    done();
                });
                tag.trigger('focus');
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
                expect(view.collection.length).to.be.equal(models.length);
            });

            it('is was rendered', function() {
                expect(view.isRendered).to.be.equal(true);
                expect(view.$el.html() !== '').to.be.equal(true);
            });
        });

        describe('behaviors', function() {

            it('has a behavior', function() {
                expect(view.behaviors.hasOwnProperty('CompositeBehavior')).to.be.equal(true);
            });

        });
    });
});
