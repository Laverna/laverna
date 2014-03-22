/*global define*/
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    /**
     * Confirm modal window
     */
    var Confirm = App.module('Confirm', {startWithParent: false}),
        showConfirm;

    Confirm.on('start', function (options) {
        showConfirm(options);
        App.mousetrap.API.reset();
        App.log('AppConfirm has been started');
    });

    Confirm.on('stop', function () {
        App.mousetrap.API.restart();
        App.log('AppConfirm has been stoped');
    });

    showConfirm = function (options) {
        require(['apps/confirm/show/controller'], function (Controller) {
            new Controller().show(options);
        });
    };

    return Confirm;

});
