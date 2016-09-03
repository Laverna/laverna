/* global chai, define, describe, before, it */
define([
    'underscore',
    'backbone.radio',
    'apps/settings/show/views/importExport',
    'collections/configs'
], function(_, Radio, Import, Configs) {
    'use strict';

    var expect = chai.expect;

    describe('Import and export tab view', function() {
        var view;

        before(function() {
            view = new Import({
                el: $('<div>'),
                collection: new Configs()
            });
            view.render();
        });

        describe('instantiated', function() {
            it('ok', function() {
                expect(view instanceof Import).to.be.equal(true);
                expect(view.$el.length !== 0).to.be.equal(true);
            });
        });

        describe('Triggers requests', function() {

            it('`export` on `importExport` channel', function(done) {
                Radio.replyOnce('importExport', 'export', function() {
                    done();
                });
                view.ui.exportData.trigger('click');
            });

            /*
            it('`import` on `importExport` channel', function(done) {
                Radio.replyOnce('importExport', 'import', function() {
                    done();
                });
                view.ui.importData.trigger('change', {target: {files: ['1']}});
            });
            */

        });
    });
});
