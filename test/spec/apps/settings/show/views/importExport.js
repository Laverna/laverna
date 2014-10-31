/* global chai, define, describe, before, it */
define([
    'underscore',
    'apps/settings/show/views/importExport',
    'collections/configs'
], function (_, Import, Configs) {
    'use strict';

    var expect = chai.expect;

    describe('Import and export tab view', function () {
        var view;

        before(function () {
            view = new Import({
                el: $('<div>'),
                collection: new Configs()
            });
            view.render();
        });

        describe('instantiated', function () {
            it('ok', function () {
                expect(view).to.be.ok();
                expect(view.$el.length).to.be.ok();
            });
        });

        describe('Triggers events', function () {
            it('collection:export', function (done) {
                view.collection.once('export', function () {
                    done();
                });
                $('#do-export', view.$el).click();
            });

            it('collection:import', function (done) {
                view.collection.once('import', function () {
                    done();
                });
                view.ui.importFile.trigger('change');
            });

            it('click on @ui.importFile', function (done) {
                view.ui.importFile.on('click', function (e) {
                    e.preventDefault();
                    done();
                });
                view.ui.importBtn.click();
            });
        });
    });
});
