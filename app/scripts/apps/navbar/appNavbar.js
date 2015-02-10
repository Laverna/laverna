/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'apps/navbar/show/controller'
], function(_, $, Marionette, App, Show) {
    'use strict';

    /**
     * Module which shows navbar
     */
    var AppNavbar = App.module('AppNavbar', {startWithParent: false}),
        controller;

    AppNavbar.on('before:start', function() {
        controller = new Show();

        App.channel.comply('navbar:show', controller.show, controller);
        App.log('AppNavbar has started');
    });

    AppNavbar.on('before:stop', function() {
        App.channel.off('navbar:show');

        controller.destroy();
        controller = undefined;

        App.log('AppNavbar has stopped');
    });

    App.on('before:start', function() {
        App.AppNavbar.start();
    });

    return AppNavbar;
});
