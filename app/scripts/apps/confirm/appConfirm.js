/*global define*/
define([
    'underscore',
    'marionette',
    'app',
    'apps/confirm/show/controller'
], function(_, Marionette, App, Controller) {
    'use strict';

    /**
     * Confirm modal window
     */
    var Confirm = App.module('Confirm', {startWithParent: false, modal: true}),
        controller;

    Confirm.on('start', function() {
        App.vent.trigger('mousetrap:reset');
        App.log('AppConfirm has started');
    });

    Confirm.on('stop', function() {
        App.vent.trigger('mousetrap:restart');

        // Destroy the controller
        controller.destroy();
        controller = null;

        App.log('AppConfirm has stoped');
    });

    App.Confirm.show = function(options) {
        App.Confirm.start();

        controller = new Controller();
        controller.show(options);
    };

    return Confirm;

});
