/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define, Modernizr*/
define([
    'underscore',
    'jquery',
    'backbone',
    'backbone.radio',
    'devicejs',
    'regions/regionManager',
    'marionette'
], function(_, $, Backbone, Radio, Device) {
    'use strict';

    var App        = new Backbone.Marionette.Application(),
        isWebkit   = ('WebkitAppearance' in document.documentElement.style),
        useWorkers = (Modernizr.webworkers && window.location.protocol !== 'file:' && !isWebkit);

    App.isMobile = (Device.mobile() === true || Device.tablet() === true);

    // Customize underscore template
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate    : /<%([\s\S]+?)%>/g
    };

    // Start a module
    App.startSubApp = function(appName, args) {
        var currentApp = appName ? App.module(appName) : null;
        if (App.currentApp === currentApp) { return; }

        // Stop previous app if current app is not modal
        if (App.currentApp && (!currentApp.options.modal || App.isMobile)) {
            App.currentApp.stop();
        }

        App.currentApp = currentApp;
        if (currentApp) {
            App.channel.trigger('app:module', appName);
            currentApp.start(args);
        }
    };

    // Returns current app
    Radio.reply('global', 'app:current', function() {
        return App.currentApp;
    });

    // @ToMove somewhere else
    App.channel.on('app:start', function() {
        $('.-loading').removeClass('-loading');
    });

    Radio.reply('global', 'is:mobile', function() {
        return App.isMobile;
    });

    Radio.reply('global', 'use:webworkers', function() {
        return useWorkers;
    });

    App.on('before:start', function() {
        Radio.trigger('global', 'app:init');
    });

    App.on('start', function() {
        console.timeEnd('App');
        Backbone.history.start({pushState: false});
        Radio.trigger('global', 'app:start');
    });

    return App;
});
