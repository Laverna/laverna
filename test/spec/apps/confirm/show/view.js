/* global chai, define, describe, before, it */
define([
    'underscore',
    'apps/confirm/show/view'
], function(_, View) {
    'use strict';

    var expect = chai.expect;

    describe('Confirm view', function() {
        var view;

        before(function() {
            view = new View({
                el: $('<div>'),
                text: 'A **markdown** content.'
            });
            view.render();
        });

        describe('render()', function() {
            it('converts Markdown to HTML', function() {
                expect(view.$('.modal-body')).to.have('strong');
            });
        });

        describe('triggers events', function() {
            it(':refuse when .refuse button was clicked', function(done) {
                view.once('refuse', done);
                view.ui.refuse.click();
            });

            it(':refuse on :hidden.modal', function(done) {
                view.once('refuse', done);
                view.trigger('hidden.modal');
            });

            it(':confirm when .confirm button was clicked', function(done) {
                view.once('confirm', done);
                view.ui.confirm.click();
            });
        });
    });
});
