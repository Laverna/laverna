/* global chai, define, describe, before, it */
define([
    'underscore',
    'apps/help/about/view'
], function(_, View) {
    'use strict';

    var expect = chai.expect;

    describe('About view', function() {
        var view;

        before(function() {
            view = new View({
                el: $('<div>'),
                appVersion : 1
            });

            view.render();
        });

        describe('render()', function() {
            it('ok', function() {
                expect(view.options.appVersion).to.be.equal(1);
                expect(typeof view.behaviors).to.be.equal('object');
                expect(view.behaviors.hasOwnProperty('ModalBehavior')).to.be.equal(true);
            });
        });

        describe('events', function() {
            it('triggers view:redirect event when it\'s closed', function(done) {
                view.on('redirect', function() {
                    done();
                });
                view.trigger('hidden.modal');
            });
        });
    });
});
