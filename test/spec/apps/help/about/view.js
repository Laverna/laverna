/* global chai, define, describe, before, it */
define([
    'underscore',
    'apps/help/about/view'
], function (_, View) {
    'use strict';

    var expect = chai.expect;

    describe('About view', function () {
        var view;

        before(function () {
            view = new View({
                el: $('<div>'),
                appVersion : 1
            });

            view.render();
        });

        describe('render()', function () {
            it('ok', function () {
                expect(view).to.be.ok();
                expect(view.options.appVersion).to.be.ok();
                expect(view.behaviors).to.be.ok();
                expect(view.behaviors.hasOwnProperty('ModalBehavior')).to.be.ok();
            });
        });

        describe('events', function () {
            it('triggers view:redirect event when it\'s closed', function (done) {
                view.on('redirect', function () {
                    done();
                });
                view.trigger('hidden.modal');
            });
        });
    });
});
