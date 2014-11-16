/* global define, chai, describe, it, before, after */
define([
    'jquery',
    'backbone',
    'helpers/uri',
    'backbone.wreqr'
], function($, Backbone, URI) {
    'use strict';

    var expect = chai.expect,
        channel = Backbone.Wreqr.radio.channel('global'),
        vent = channel.vent,
        reqres = channel.reqres;

    describe('URI helper', function() {
        it('is an object', function() {
            expect(typeof URI).to.be.equal('object');
        });

        before(function() {
            Backbone.history.stop();
            Backbone.history.start();
            Backbone.history.navigate('', {trigger: false});
        });

        after(function() {
            Backbone.history.navigate('', {trigger: false});
            Backbone.history.stop();
        });

        it('has functions', function() {
            expect(typeof URI.init).to.be.equal('function');
            expect(typeof URI.navigateLink).to.be.equal('function');
            expect(typeof URI.navigate).to.be.equal('function');
            expect(typeof URI.goBack).to.be.equal('function');
            expect(typeof URI.getCurrentRoute).to.be.equal('function');
            expect(typeof URI.getProfile).to.be.equal('function');
            expect(typeof URI.link).to.be.equal('function');
            expect(typeof URI.note).to.be.equal('function');
        });

        describe('Responses to requests', function() {
            it('uri:route', function() {
                expect(reqres.request('uri:route')).to.be.equal('');
            });

            it('uri:profile', function() {
                expect(reqres.request('uri:profile')).to.be.equal(null);
            });

            it('uri:link', function() {
                expect(reqres.request('uri:link', '/notes'))
                    .to.be.equal('/notes');
            });

            it('uri:note', function() {
                var note = { id: '1' },
                    options = {
                        filter: 'search',
                        query : 'hello'
                    };

                expect(reqres.request('uri:note', options, note))
                   .to.be.equal('/notes/f/search/q/hello/p0/show/1');
            });
        });

        describe('Listens to events', function() {
            function isEqualNote(done, link) {
                setTimeout(function() {
                    expect(reqres.request('uri:route')).to.be.equal(link);
                    vent.trigger('navigate', '/', {trigger: false});
                    done();
                }, 20);
            }

            it('navigate', function(done) {
                vent.once('navigate', function() {
                    isEqualNote(done, 'notes');
                });
                vent.trigger('navigate', '/notes', {trigger: false});
            });

            it('navigate:link', function(done) {
                vent.once('navigate:link', function() {
                    isEqualNote(done, 'notes/p/0');
                });
                vent.trigger('navigate:link', '/notes/p/0', {trigger: false});
            });

            it('navigate:back', function(done) {
                vent.once('navigate:back', function() {
                    isEqualNote(done, 'notebooks');
                });
                vent.trigger('navigate', '/notebooks', {trigger: false});
                vent.trigger('navigate', '/', {trigger: false});
                vent.trigger('navigate:back', '/notes', -1);
            });
        });
    });
});
