/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, afterEach, it */
define([
    'sinon',
    'underscore',
    'backbone.radio',
    'collections/pageable'
], function(sinon, _, Radio, Pageable) {
    'use strict';

    describe('collections/pageable', function() {
        var page,
            vent,
            models;

        before(function() {
            vent   = Radio.channel('notes');
            models = [];
            for (var i = 0; i < 20; i++) {
                models.push({id: i, title: 'hello'});
            }
        });

        beforeEach(function() {
            page = new Pageable(models);
            page.storeName = 'notes';
            page.fullCollection = page.clone();
        });

        describe('.registerEvents()', function() {

            beforeEach(function() {
                page.registerEvents();
            });

            afterEach(function() {
                page.stopListening();
            });

            it('channel name for events is `storeName`', function() {
                expect(page.vent).to.be.an('object');
                expect(page.vent.channelName).to.be.equal(page.storeName);
            });

            it('starts listening to events', function() {
                page.stopListening();

                expect((page._events || {})['change:isFavorite']).to.be.an('undefined');
                expect((page.vent._events || {})['update:model']).to.be.an('undefined');

                page.registerEvents();
                expect(page._events).to.be.an('object');
                expect(page.vent).to.be.an('object');
            });

            it('listens to events triggered to itself', function() {
                expect(page._events['change:isFavorite']).to.be.an('array');
                expect(page._events.reset).to.be.an('array');
            });

            it('listens to events triggered to .vent', function() {
                expect(page.vent._events['update:model']).to.be.an('array');
                expect(page.vent._events['destroy:model']).to.be.an('array');
                expect(page.vent._events['restore:model']).to.be.an('array');
            });

        });

        describe('.removeEvents()', function() {

            it('stops listening to events', function() {
                page.registerEvents().removeEvents();

                expect((page._events || {})['change:isFavorite']).to.be.an('undefined');
                expect((page.vent._events || {})['update:model']).to.be.an('undefined');
            });

            it('resets .fullCollection', function() {
                var spy = sinon.spy(page.fullCollection, 'reset');
                page.removeEvents();
                expect(spy).to.have.been.called;
            });

        });

        describe('.getNextPage()', function() {

            it('resets itself', function() {
                var spy = sinon.spy(page, 'reset');
                page.getNextPage();
                expect(spy).to.have.been.called;
            });

            it('increases current page number', function() {
                var initial = page.state.currentPage;
                page.getNextPage();
                expect(page.state.currentPage).to.be.equal(initial + 1);
            });

        });

        describe('.getPreviousPage()', function() {

            it('resets itself', function() {
                var spy = sinon.spy(page, 'reset');
                page.getPreviousPage();
                expect(spy).to.have.been.called;
            });

            it('increases current page number', function() {
                var initial = page.state.currentPage;
                page.getPreviousPage();
                expect(page.state.currentPage).to.be.equal(initial - 1);
            });

        });

        describe('.getPage()', function() {

            it('returns an array', function() {
                expect(page.getPage(0)).to.be.an('array');
            });

            it('changes currentPage state', function() {
                page.getPage(25);
                expect(page.state.currentPage).to.be.equal(25);
            });

            it('overwrites .models', function() {
                var length = page.models.length;
                page.getPage(1);
                expect(page.models.length).to.be.equal(page.state.pageSize);
                expect(page.models.length).to.be.below(length);
            });

        });

        describe('.getOffset()', function() {

            it('offset is equal page number * page size', function() {
                expect(page.getOffset(2)).to.be.equal(2 * page.state.pageSize);
            });

            it('uses different formula if first page does not start from 0', function() {
                page.state.firstPage = 1;
                expect(page.getOffset(2)).to.be.equal((2 - 1) * page.state.pageSize);
            });

        });

        it('.hasPreviousPage()', function() {
            expect(page.hasPreviousPage()).to.be.equal(false);
            page.state.currentPage = 1;
            expect(page.hasPreviousPage()).to.be.equal(true);
        });

        it('.hasNextPage()', function() {
            page.state.totalPages = models.length;

            expect(page.hasNextPage()).to.be.equal(true);
            page.state.currentPage = models.length;
            expect(page.hasNextPage()).to.be.equal(true);
        });

        describe('.sortFullCollection()', function() {

            it('does nothing if .fullCollection does not exist', function() {
                page.fullCollection = null;
                page.sortFullCollection();
                expect(page.models.length).to.be.equal(models.length);
            });

            it('sorts .fullCollection', function() {
                var spy = sinon.spy(page.fullCollection, 'sortItOut');
                page.sortFullCollection();
                expect(spy).to.have.been.called;
            });

            it('calls ._updateTotalPages()', function() {
                var spy = sinon.spy(page, '_updateTotalPages');
                page.sortFullCollection();
                expect(spy).to.have.been.called;
            });

            it('calls .getPage()', function() {
                var spy = sinon.spy(page, 'getPage');
                page.sortFullCollection();
                expect(spy).to.have.been.calledWith(page.state.currentPage);
            });

            it('resets itself', function(done) {
                page.once('reset', function() { done(); });
                page.sortFullCollection();
            });

        });

        describe('.getNextItem()', function() {

            beforeEach(function() {
                page.registerEvents();
            });

            afterEach(function() {
                page.removeEvents();
            });

            it('returns false if the collection is empty', function() {
                page.reset([]);
                expect(page.getNextItem()).to.be.equal(false);
            });

            it('triggers `model:navigate` event', function(done) {
                page.vent.once('model:navigate', function(model) {
                    expect(model).to.be.equal(page.at(1));
                    done();
                });

                page.getNextItem(page.at(0));
            });

            it('returns the first model if ID is incorrect', function(done) {
                page.vent.once('model:navigate', function(model) {
                    expect(model.id).to.be.equal(page.at(0).id);
                    done();
                });

                page.getNextItem('hello-world');
            });

            it('triggers `page:next` if it\'s the last model on page', function(done) {
                page.models = page.models.slice(0, page.state.pageSize);
                page.once('page:next', done);
                page.getNextItem(page.at(page.state.pageSize - 1));
            });

            it('triggers `page:end` if it\'s the last model', function(done) {
                page.models = page.models.slice(0, page.state.pageSize);
                page.state  = _.extend(page.state, {
                    currentPage: 1,
                    totalPages : 2
                });

                page.once('page:end', done);
                page.getNextItem(page.at(page.models.length - 1));
            });

        });

        describe('.getPreviousPage()', function() {

            beforeEach(function() {
                page.registerEvents();
            });

            afterEach(function() {
                page.removeEvents();
            });

            it('returns false if the collection is empty', function() {
                page.reset([]);
                expect(page.getPreviousItem()).to.be.equal(false);
            });

            it('triggers `model:navigate` event', function(done) {
                page.vent.once('model:navigate', function(model) {
                    expect(model.id).to.be.equal(page.at(2).id);
                    done();
                });

                page.getPreviousItem(page.at(3));
            });

            it('returns the last model if ID is incorrect', function(done) {
                page.vent.once('model:navigate', function(model) {
                    expect(model.id).to.be.equal(page.at(page.length - 1).id);
                    done();
                });

                page.getPreviousItem('hello-world');
            });

            it('triggers `page:previous` if it\'s the first model on the page', function(done) {
                page.state.currentPage = 2;
                page.once('page:previous', done);
                page.getPreviousItem(page.at(0));
            });

            it('triggers `page:start` if it\'s the first model', function(done) {
                page.state.currentPage = page.state.firstPage;
                page.once('page:start', done);
                page.getPreviousItem(page.at(0));
            });

        });

        describe('._navigateOnRemove()', function() {

            it('does nothing if the model isn\'t in the collection', function() {
                var model = page.at(0);
                page.remove(model);
                expect(page._navigateOnRemove(model)).to.be.equal(false);
            });

            it('removes the model from the collection', function() {
                var spy = sinon.spy(page.fullCollection, 'remove');
                page._navigateOnRemove(page.at(1));
                expect(spy).called;
            });

            it('sorts .fullCollection', function() {
                var spy = sinon.spy(page, 'sortFullCollection');
                page._navigateOnRemove(page.at(0));
                expect(spy).to.be.called;
            });

            it('triggers `model:navigate`', function(done) {
                vent.once('model:navigate', function(model) {
                    expect(model.id).to.be.equal(page.at(0).id);
                    done();
                });

                page._navigateOnRemove(page.at(0));
            });

        });

        describe('._onRestore()', function() {

            it('calls ._onAddItem() if .conditionFilter is not equal to `trashed`', function(done) {
                page._onAddItem = done;
                page._onRestore();
            });

            it('.conditionFilter is equal to `trashed` and it\'s not the last model', function(done) {
                page.conditionFilter = 'trashed';
                page._navigateOnRemove = done;
                page._onRestore();
            });

        });

        describe('._onAddItem()', function() {
            var model;

            beforeEach(function() {
                model = new page.model({id: 'test-on-add-item', title: 'hello', trash: 0});
            });

            it('does not add models from other profiles', function() {
                model.profileId = 'test-db';
                page._onAddItem(model);
                expect(page.get(model.id)).to.be.an('undefined');
            });

            it('removes the model from the collection if it does not meet condition', function() {
                var spy = sinon.spy(page, '_navigateOnRemove');
                page.conditionCurrent = {title: 'world'};
                page._onAddItem(model);

                expect(spy).calledWith(model);
            });

            it('adds a model to the collection if it does not exist', function() {
                page._onAddItem(model);
                expect(page.at(0).id).to.be.equal(model.id);
            });

        });

        describe('._onRemoveItem()', function() {

            it('removes the model from .fullCollection', function() {
                var spy = sinon.spy(page.fullCollection, 'remove');
                page._onRemoveItem(page.at(0));
                expect(spy).to.be.called;
            });

            it('sorts .fullCollection afterwards', function(done) {
                page.sortFullCollection = done;
                page._onRemoveItem(page.at(0));
            });

        });

    });

});
