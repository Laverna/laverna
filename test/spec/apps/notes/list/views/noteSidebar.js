/* global define, describe, before, after, it, chai */
define([
    'backbone.radio',
    'Mousetrap',
    'apps/notes/list/views/noteSidebar',
    'collections/notes',
    'spec/apps/notes/list/views/noteSidebarItem'
], function(Radio, Mousetrap, View, Notes) {
    'use strict';

    var expect = chai.expect;

    function overwriteMethod(name) {
        var fnc = View.prototype[name];
        View.prototype[name] = function() {
            if (typeof arguments[0] === 'function') {
                return arguments[0]();
            }
            fnc.apply(this, arguments);
        };
    }

    describe('Notes list composite view', function() {
        var view;

        before(function() {
            overwriteMethod('modelFocus');

            Radio.replyOnce('global', 'configs', function() {
                return {
                    navigateBottom : 'j',
                    navigateTop    : 'k',
                };
            });

            view = new View({
                el         : $('<div/>'),
                args       : {},
                collection : new Notes([
                    {title : 'Title'},
                    {title : 'Title2'}
                ])
            });
        });

        after(function() {
            view.trigger('destroy');
        });

        it('is an object', function() {
            expect(typeof view).to.be.equal('object');
        });

        it('is an instance of View', function() {
            expect(view instanceof View).to.be.equal(true);
        });

        describe('Triggers', function() {
            it('request `route:args` on `appNote` channel', function(done) {
                Radio.replyOnce('appNote', 'route:args', function() {
                    done();
                });
                view.onBeforeRender();
            });

            it('event `navigate:link` on `global` channel', function(done) {
                Radio.once('global', 'navigate:link', function() {
                    done();
                });
                view.navigatePage(1);
            });
        });

        describe('Listens to', function(done) {
            it('event `model:navigate` on `notes` channel', function(done) {
                Radio.trigger('notes', 'model:navigate', done);
            });

            it('keyboard event "j"', function(done) {
                Radio.once('notes', 'model:navigate', function() {
                    done();
                });
                Mousetrap.trigger(view.configs.navigateBottom);
            });

            it('keyboard event "k"', function(done) {
                Radio.once('notes', 'model:navigate', function() {
                    done();
                });
                Mousetrap.trigger(view.configs.navigateTop);
            });
        });
    });
});
