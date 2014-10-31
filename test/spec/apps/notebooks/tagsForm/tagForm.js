/* global chai, define, describe, before, it */
define([
    'require',
    'underscore',
    'jquery',
    'models/tag',
    'apps/notebooks/tagsForm/formView'
], function (require, _, $, Tag, FormView) {
    'use strict';

    var expect = chai.expect;

    describe('Tag form view', function () {
        var tag,
            view;

        before(function () {
            tag = new Tag({
                id  : 1,
                name: 'Tag name'
            });

            view = new FormView({
                el: $('<div>'),
                model: tag,
                data: tag.toJSON()
            });

            view.render();
        });

        describe('View is rendered', function () {
            it('is rendered', function () {
                expect(view).to.be.ok();
                expect(view.$el.length).not.to.be.equal(0);
            });

            it('model was passed', function () {
                expect(view.model).to.be.equal(tag);
            });

            it('Shows tags name', function () {
                expect(view.ui.name).to.have.value(tag.get('name'));
            });

            it('Shows validation errors', function (done) {
                tag.once('invalid', function (model, errors) {
                    _.forEach(errors, function (err) {
                        expect(view.ui[err].parent()).to.have.class('has-error');
                        if (errors[errors.length - 1] === err) {
                            done();
                        }
                    });
                });
                tag.save({
                    'name': ''
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

            it('view:save when user hits OK button', function (done) {
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
