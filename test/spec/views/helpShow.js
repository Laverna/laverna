/* global chai, define, describe, before, it */
define([
    'underscore',
    'collections/configs',
    'apps/help/show/view'
], function (_, Configs, View) {
    'use strict';

    var expect = chai.expect;

    describe('Shortcuts help view', function () {
        var view,
            configs;

        before(function () {
            configs = new Configs();
            configs.resetFromJSON(configs.configNames);
            configs.reset(configs.shortcuts());

            view = new View({
                el: $('<div>'),
                collection: configs
            });

            view.render();
        });

        describe('render()', function () {
            it('ok', function () {
                expect(view).to.be.ok();
                expect(view.collection).to.be.ok();
                expect(view.behaviors).to.be.ok();
                expect(view.behaviors.hasOwnProperty('ModalBehavior')).to.be.ok();
            });

            it('shows all shortcuts', function () {
                expect(view.$el).to.have('td');
                expect($('tbody tr', view.$el).length).to.be.equal(configs.length);
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
