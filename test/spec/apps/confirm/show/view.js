/* global define, chai, describe, before, it */
define([
    'underscore',
    'apps/confirm/show/view'
], function(_, View) {
    'use strict';

    var expect = chai.expect;

    describe('Confirm view', function() {
        var view;

        function checkEvent(needEv, done) {
            view.once('click', function(ev) {
                expect(ev).to.be.equal(needEv);
                done();
            });
        }

        before(function() {
            view = new View({
                el: $('<div>'),
                content: 'A **markdown** content.'
            });
            view.render();
        });

        describe('triggers events', function() {

            it('cancel if cancel button is clicked', function(done) {
                checkEvent('cancel', done);
                view.$('[data-event="cancel"]').click();
            });

            it('confirm if confirm button is clicked', function(done) {
                checkEvent('confirm', done);
                view.$('[data-event="confirm"]').click();
            });

            it('cancel on `hidden.modal`', function(done) {
                checkEvent('cancel', done);
                view.trigger('hidden.modal');
            });

        });
    });
});
