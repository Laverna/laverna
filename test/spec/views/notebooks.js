/* global define, describe, before, it */
define([
    'require',
    'jquery',
    'chai',
    'models/notebook',
    'apps/notebooks/list/views/notebooksItem'
], function (require, $, chai, Notebook, ItemView) {
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
                expect(view).to.be.ok;
            });

            it('model was passed', function () {
                expect(view.model).to.be.equal(notebook);
            });
        });

        describe('render()', function () {
            it('is not empty', function () {
                expect(viewHtml !== '').to.be.ok;
            });

            it('model', function () {
                var regx = new RegExp(notebook.get('name'), 'gi');
                expect(regx.test(viewHtml)).to.be.ok;
            });
        });

    });

});
