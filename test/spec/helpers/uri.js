/* global define, chai, describe, it, before, after, afterEach */
define([
    'jquery',
    'backbone',
    'marionette',
    'backbone.radio',
    'helpers/uri',
], function($, Backbone, Marionette, Radio, URI) {
    'use strict';

    var expect = chai.expect,
        vent   = Radio.channel('uri');

    describe('URI helper', function() {
        var uri;

        before(function() {
            Backbone.history.stop();
            Backbone.history.start();
            Backbone.history.navigate('', {trigger: false});

            uri = new URI();
        });

        afterEach(function() {
            Backbone.history.navigate('', {trigger: false});
        });

        after(function() {
            Backbone.history.stop();
        });

        describe('Replies', function() {

            describe('"profile"', function() {

                it('returns null for default', function() {
                    expect(vent.request('profile')).to.be.equal(null);
                });

                it('returns current profile', function() {
                    Backbone.history.navigate('/p/notes/', {trigger: false});
                    expect(vent.request('profile')).to.be.equal('notes');
                });

            });

            it('link:profile', function() {
                expect(vent.request('link:profile', '', 'private').search('/p/private') !== -1).to.be.equal(true);
            });

            it('link', function() {
                var link = vent.request(
                    'link',
                    {page: 2, filter: 'active'},
                    {id: 'random-id'}
                );

                expect(link.search('random-id') > -1).to.be.equal(true);
                expect(link.search('2') > -1).to.be.equal(true);
                expect(link.search('active') > -1).to.be.equal(true);
            });

            it('navigate', function() {
                vent.request('navigate', '#/notebooks');
                expect(document.location.hash.search('/notebooks') !== -1).to.be.equal(true);
            });

            it('back', function() {
                if (!document.location.hash) {
                    return;
                }

                vent.request('navigate', '#/notes');
                vent.request('navigate', '#/notebooks');

                vent.request('back');
                expect(document.location.hash.search('/notes') !== -1).to.be.equal(true);
            });

        });

    });
});
