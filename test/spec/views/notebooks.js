/* global define, describe, before, it */
define([
    'require',
    'jquery',
    'chai',
    'models/notebook',
    'collections/notebooks',
    'apps/notebooks/list/views/notebooksItem',
    'apps/notebooks/list/views/notebooksComposite'
], function (require, $, chai, Notebook, Notebooks, ItemView, ListView) {
    'use strict';

    var expect = chai.expect;

    describe('Notebook ItemView', function () {
        var notebook,
            view,
            viewHtml;

        before(function () {
            notebook = new Notebook({
                id  : 1,
                name: 'This is notebook name'
            });

            view = new ItemView({
                el: $('<div>'),
                model: notebook
            });

            view.render();
            viewHtml = view.$el.html();
        });

        describe('instantiated', function () {
            it('should exist', function () {
                expect(view).to.be.ok();
            });

            it('model was passed', function () {
                expect(view.model).to.be.equal(notebook);
            });
        });

        describe('render()', function () {
            it('is not empty', function () {
                expect(viewHtml !== '').to.be.ok();
            });

            it('model', function () {
                var regx = new RegExp(notebook.get('name'), 'gi');
                expect(regx.test(viewHtml)).to.be.ok();
            });
        });

    });

    describe('Notebook CompositeView', function () {
        var notebooks,
            view,
            viewHtml,
            models = [];

        before(function () {

            for (var i = 0; i < 10; i++) {
                models.push({
                    id: i,
                    name: 'Notebook #' + i,
                    parentId: (i - 1)
                });
            }

            notebooks = new Notebooks(models);

            // Instantiate a CompositeView
            view = new ListView({
                el: $('<div>'),
                // el: $('div'),
                collection: notebooks
            });
            view.render();
            viewHtml = view.$el.html();
        });

        describe('instantiated', function () {
            it('collection is not empty', function () {
                expect(notebooks.length).to.be.ok(models.length);
            });

            it('is was rendered', function () {
                expect(view.isRendered).to.be.ok();
                expect(viewHtml !== '').to.be.ok();
            });
        });

        describe('nested view', function () {
            it('items are nested', function () {
                for (var i = 0; i < notebooks.length; i++) {
                    var div = view.$el.find('div.tags[data-id=' + i + ']').html();
                    if (i === (notebooks.length - 1)) {
                        expect(div === '').to.be.ok();
                    }
                    else {
                        expect(div !== '').to.be.ok();
                    }
                }
            });
        });
    });

});
