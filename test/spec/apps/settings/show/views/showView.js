/* global chai, define, describe, before, it */
define([
    'underscore',
    'jquery',
    'collections/configs',
    'apps/settings/show/views/showView',
], function(_, $, Configs, View) {
    'use strict';

    var expect = chai.expect;

    describe('Settings view', function() {
        var view,
            configs;

        before(function() {
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            view = new View({
                el: $('<div>'),
                collection : configs,
                tab: 'general',
                args: {}
            });

            view.render();
        });

        it('should exist', function() {
            expect(view instanceof View).to.be.equal(true);
        });

        it('has "content" region', function() {
            expect(typeof view.regions).to.be.equal('object');
            expect(typeof view.regions.content).to.be.equal('string');
        });

        it('has "ContentBehavior"', function() {
            expect(typeof view.behaviors).to.be.equal('object');
            expect(typeof view.behaviors.ContentBehavior).to.be.equal('object');
        });

    });
});
