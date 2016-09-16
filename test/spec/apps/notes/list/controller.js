/* global define, describe, before, after, it, chai */
define([
    'backbone.radio',
    'apps/notes/list/controller',
    'spec/apps/notes/list/views/noteSidebar'
], function(Radio, Controller) {
    'use strict';

    var expect = chai.expect;

    function overwriteMethod(name) {
        var fnc = Controller.prototype[name];
        Controller.prototype[name] = function() {
            if (typeof arguments[0] === 'function') {
                return arguments[0]();
            }
            fnc.apply(this, arguments);
        };
    }

    describe('Notes list controller', function() {
        var controller;

        before(function() {
            overwriteMethod('onModelActive');
            overwriteMethod('navigate');

            controller = new Controller({});
        });

        after(function() {
            if (controller.view) {
                controller.destroy();
            }
        });

        it('is an object', function() {
            expect(typeof controller).to.be.equal('object');
        });

        it('is an instance of Controller', function() {
            expect(controller instanceof Controller).to.be.equal(true);
        });

        describe('triggers', function() {

            it('requests notes on `notes` channel', function(done) {
                Radio.replyOnce('notes', 'filter', function() {
                    done();
                    return [];
                });
                controller.filter({filter: 'favorite'});
            });

            it('event `navigate` on `global` channel', function(done) {
                Radio.once('global', 'navigate', function() {
                    done();
                });
                controller.navigate();
            });

        });

        describe('Listens to events', function() {

            it('on `appNote` channel to `model:active` event', function(done) {
                Radio.trigger('appNote', 'model:active', done);
            });

            it('on `notes` channel to `model:navigate` event', function(done) {
                Radio.trigger('notes', 'model:navigate', done);
            });

        });
    });
});
