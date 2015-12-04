/* global define, describe, before, after, it, chai */
define([
    'backbone',
    'backbone.radio',
    'apps/notes/list/views/noteSidebarItem',
    'collections/notes'
], function(Backbone, Radio, View, Notes) {
    'use strict';

    var expect = chai.expect;

    describe('Notes list item view', function() {
        var view,
            notes;

        before(function() {
            notes = new Notes([
                {id: 1, title: 'Title', content: 'Content'}
            ]);

            Radio.reply('editor', 'content:html', function(text) {
                return text;
            });

            view = new View({
                el   : $('<div/>'),
                model: notes.get(1),
                args : {}
            });

            view.render();
        });

        after(function() {
            Radio.stopReplying('editor', 'content:html');
            view.trigger('destroy');
        });

        it('is an object', function() {
            expect(typeof view).to.be.equal('object');
        });

        it('instance of View', function() {
            expect(view instanceof View).to.be.equal(true);
        });

        describe('Listens to model events', function() {
            it('change', function(done) {
                view.once('render', function() {
                    done();
                });
                view.model.trigger('change');
            });

            it('focus', function(done) {
                var $item = view.$('.list-group-item');
                view.model.once('focus', function() {
                    expect($item).to.have.class('active');
                    done();
                });
                view.model.trigger('focus');
            });

        });

        describe('Triggers', function() {
            it('event "scroll:top" to itself', function(done) {
                view.once('scroll:top', function() {
                    done();
                });
                view.model.trigger('focus');
            });

            it('command "save" to "notes" channel when a user clicks on favorite button', function(done) {
                Radio.complyOnce('notes', 'save', function(model) {
                    expect(model).to.be.equal(view.model);
                    done();
                });
                view.ui.favorite.trigger('click');
            });
        });

    });
});
