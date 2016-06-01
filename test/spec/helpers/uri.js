/*jshint expr: true*/
/* global define, expect, describe, it, before, after, afterEach */
define([
    'sinon',
    'underscore',
    'backbone',
    'helpers/uri'
], function(sinon, _, Backbone, Uri) {
    'use strict';

    describe('helpers/uri', function() {
        var uri;

        before(function() {
            uri = new Uri();

            // Prevent it from reloading the page
            $(window).off('hashchange');

            Backbone.history.start();
            Backbone.history.navigate('', {trigger: false});
        });

        after(function() {
            uri.destroy();

            Backbone.history.stop();
            Backbone.history.navigate('', {trigger: false});
        });

        afterEach(function() {
            uri.navigate('/');
        });

        describe('.navigate()', function() {

            it('changes location hash', function() {
                uri.navigate('/notebooks');
                expect(document.location.hash).to.contain('notebooks');
            });

            it('builds URL to a notes list and changes location hash', function() {
                uri.navigate({options: {filter: 'notebooks', query: 'id-1', page: 1}});
                expect(document.location.hash).to.contain('notes/f/notebooks/q/id-1');
            });

            it('it is not neccessary to provide options.options', function() {
                uri.navigate({filter: 'notebooks', query: 'id-2', page: 1});
                expect(document.location.hash).to.contain('notes/f/notebooks/q/id-2');
            });

            it('adds a profile link to the link and changes the hash', function() {
                uri.navigate('/p/notes/', {trigger: false});
                uri.navigate('/notebooks', {includeProfile: true});
                expect(document.location.hash).to.contain('p/notes/notebooks');
            });

        });

        describe('.navigateBack()', function() {

            it('navigates back', function() {
                if (/WebKit/.test(window.navigator.userAgent)) {
                    console.warn('history.back does not work properly in Chrome');
                    return;
                }

                uri.navigate('/p/notes1/');
                uri.navigate('/p/notes2/');
                uri.navigateBack();

                expect(document.location.hash).to.contain('p/notes1');
            });

        });

        describe('.getFileLink()', function() {

            it('generates a pseudo URL', function() {
                expect(uri.getFileLink({id: 'id1'})).to.be.equal('#file:id1');
            });

        });

        describe('.getProfileLink()', function() {

            it('adds profile link to the original URL', function() {
                expect(uri.getProfileLink('/notes', 'default'))
                    .to.be.equal('/p/default/notes');
            });

            it('calls .getProfile() if profile name was not provided', function() {
                var spy = sinon.spy(uri, 'getProfile');
                uri.getProfileLink('/notes');

                expect(spy).to.have.been.called;
            });

            it('adds `/` to the beginning', function() {
                expect(uri.getProfileLink('notes')).to.be.equal('/notes');
            });

        });

        describe('.getProfile()', function() {

            it('returns null if profile is not in the hash', function() {
                expect(uri.getProfile()).to.be.equal(null);
            });

            it('returns profile name', function() {
                uri.navigate('/p/profileTest/');
                expect(uri.getProfile()).to.be.equal('profileTest');
            });

        });

        describe('.getRoute()', function() {

            it('returns location hash', function() {
                uri.navigate('/test/page');
                expect(document.location.hash).to.contain(uri.getRoute());
            });

        });

        describe('.getLink()', function() {

            it('returns a link to notes list', function() {
                expect(uri.getLink()).to.be.equal('/notes');
            });

            it('returns a link to filtered notes list', function() {
                expect(uri.getLink({filter: 'tags', query: 'hello'}))
                    .to.be.equal('/notes/f/tags/q/hello');
            });

            it('adds pagination links', function() {
                expect(uri.getLink({filter: 'tags', query: 'hello', page: 10}))
                    .to.be.equal('/notes/f/tags/q/hello/p10');
            });

            it('returns a link to a note', function() {
                expect(uri.getLink({filter: 'tags', query: 'hello'}, {id: 'model-id'}))
                    .to.be.equal('/notes/f/tags/q/hello/show/model-id');
            });

        });

        describe('Replies to requests', function() {

            it('listens on `uri` channel', function() {
                expect(uri).to.have.property('vent');
                expect(uri.vent.channelName).to.be.equal('uri');
            });

            it('has replies', function() {
                var replies = ['navigate', 'back', 'profile', 'link:profile', 'link:file', 'link', 'get:current'];

                expect(_.keys(uri.vent._requests).length).to.be.equal(replies.length);

                _.each(replies, function(name) {
                    expect(_.keys(uri.vent._requests)).to.include(name);
                });
            });

        });

    });
});
