/* global chai, define, describe, before, it */
define([
    'underscore',
    'collections/configs',
    'apps/help/show/view'
], function(_, Configs, View) {
    'use strict';

    var expect = chai.expect;

    describe('Shortcuts help view', function() {
        var view,
            configs;

        before(function() {
            configs = new Configs();
            configs.resetFromJSON(configs.configNames);
            configs.reset(configs.shortcuts());

            view = new View({
                el: $('<div>'),
                collection: configs
            });

            view.render();
        });

        describe('render()', function() {
            it('ok', function() {
                expect(typeof view.collection).to.be.equal('object');
                expect(typeof view.behaviors).to.be.equal('object');
                expect(view.behaviors.hasOwnProperty('ModalBehavior')).to.be.equal(true);
            });

            it('shows all shortcuts', function() {
                expect(view.$el).to.have('td');
                expect($('tbody tr', view.$el).length).to.be.equal(configs.length);
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
