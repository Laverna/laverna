/* global chai, define, describe, before, it */
define([
    'jquery',
    'collections/configs',
    'apps/settings/show/views/profiles'
], function($, Configs, View) {
    'use strict';

    var expect = chai.expect;

    describe('Profiles settings view', function() {
        var view,
            configs;

        before(function(done) {
            var profiles;
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            profiles = configs.get('appProfiles');
            profiles.set('value', JSON.stringify(['notes-db', 'new']));

            view = new View({
                el: $('<div>'),
                collection: configs,
                profiles: profiles
            });

            view.render();
            done();
        });

        describe('is not empty', function() {
            it('ok', function() {
                expect(view.$el).not.be.empty();
                expect(view.$el).to.have('input');
                console.log(view.options.profiles.get('value'));
            });

            it('shows profiles list', function() {
                expect(view.$('table').length !== 0).to.be.equal(true);
                expect(view.$('tr').length === 4).to.be.equal(true);
            });

        });

        describe('Triggers events', function() {
            it('create:profile', function(done) {
                var e = $.Event('keypress');
                e.which = 13;

                view.once('create:profile', function(name) {
                    expect(name).to.be.equal(view.ui.profile.val());
                    done();
                });

                view.ui.profile.val('profileI');
                view.ui.profile.trigger(e);
            });

            it('remove:profile', function(done) {
                console.log($('.removeProfile'));
                view.once('remove:profile', function(name) {
                    expect(name !== '').to.be.equal(true);
                    done();
                });

                view.$('.removeProfile').trigger('click');
            });
        });
    });
});
