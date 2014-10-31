/* global chai, define, describe, before, it */
define([
    'require',
    'underscore',
    'jquery',
    'models/notebook',
    'collections/notebooks',
    'apps/notebooks/notebooksForm/formView'
], function (require, _, $, Notebook, Notebooks, FormView) {
    'use strict';

    var expect = chai.expect;

    describe('Notebook\'s form view', function () {
        var notebook,
            notebooks,
            models = [],
            view;

        before(function () {
            notebook = new Notebook({
                id  : 1,
                name: 'Notebook'
            });

            for (var i = 0; i < 10; i++) {
                models.push(_.extend(
                    {},
                    notebook.toJSON(),
                    { id: i + 1, parentId: i}
                ));
            }

            notebooks = new Notebooks(models, {
                comparator: 'name'
            });
            notebook = notebooks.get(2);

            view = new FormView({
                el: $('<div>'),
                collection: notebooks,
                model: notebook,
                data: notebook.decrypt()
            });

            view.render();
        });

        describe('View is rendered', function () {
            it('is rendered', function () {
                expect(view).to.be.ok();
                expect(view.$el.length).not.to.be.equal(0);
            });

            it('model was passed', function () {
                expect(view.model).to.be.equal(notebook);
            });

            it('collection was passed', function () {
                expect(view.collection).to.be.equal(notebooks);
            });

            it('Shows notebook\'s name', function () {
                expect(view.ui.name).to.have.value(notebook.get('name'));
            });

            it('Shows notebook\'s parent', function () {
                var par = $(':selected', view.ui.parentId);
                expect(view.ui.parentId).to.have(':selected');
                expect(par.val()).to.be.equal(notebook.get('parentId'));
            });

            it('Shows validation errors', function (done) {
                notebook.once('invalid', function (model, errors) {
                    _.forEach(errors, function (err) {
                        expect(view.ui[err].parent()).to.have.class('has-error');
                        if (errors[errors.length - 1] === err) {
                            done();
                        }
                    });
                });
                notebook.save({
                    'name': '',
                    'parentId': notebook.get('id')
                });
            });
        });

        describe('Triggers events', function () {
            it('view:save when user submits the form', function (done) {
                view.once('save', function () {
                    done();
                });
                $('.form-horizontal', view.$el).submit();
            });

            it('view:save when user OK button', function (done) {
                view.once('save', function () {
                    done();
                });
                $('.ok', view.$el).click();
            });

            it('view:redirect', function (done) {
                view.once('redirect', function () {
                    done();
                });
                view.trigger('hidden.modal');
            });

            it('view:close when user hits cancel', function (done) {
                view.once('close', function () {
                    done();
                });
                $('.cancelBtn', view.$el).click();
            });
        });
    });
});
