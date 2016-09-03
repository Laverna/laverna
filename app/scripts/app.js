/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define, Modernizr*/
define([
    'helpers/underscore-util',
    'jquery',
    'backbone',
    'backbone.radio',
    'devicejs',
    'regions/regionManager',
    'marionette',
    'i18next'
], function(_, $, Backbone, Radio, Device) {
    'use strict';

    var App = new Backbone.Marionette.Application(),
        env = {
            isWebkit : ('WebkitAppearance' in document.documentElement.style),
            isMobile : (Device.mobile() === true || Device.tablet() === true),
            platform : 'browser',
            ua       : window.navigator.userAgent
        },
        render;

    env.useWorkers = (Modernizr.webworkers && window.location.protocol !== 'file:' && !env.isWebkit);

    if (/(palemoon|sailfish)/i.test(env.ua)) {
        env.useWorkers = false;
    }

    if (env.isMobile) {
        env.platform = 'mobile';
    }
    else if (window.requireNode) {
        env.platform = 'electron';
    }

    // Customize underscore template
    _.templateSettings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /\{=([\s\S]+?)\}/g,
        escape      : /\{\{([\s\S]+?)\}\}/g,
    };

    /**
     * Overrite renderer in order to have access to
     * additional functions in templates (like, i18n).
     */
    render = Backbone.Marionette.Renderer.render;

    Backbone.Marionette.Renderer.render = function(template, data) {
        data = _.extend(data || {}, {
            i18n      : $.t,
            cleanXSS  : _.cleanXSS,
            stripTags : _.stripTags
        });

        return render(template, data);
    };

    // Start a module
    App.startSubApp = function(appName, args) {
        var currentApp = appName ? App.module(appName) : null;
        if (App.currentApp === currentApp) { return; }

        // Stop previous app if current app is not modal
        if (App.currentApp && (!currentApp.options.modal || env.isMobile)) {
            App.currentApp.stop();
        }

        App.currentApp = currentApp;
        if (currentApp) {
            App.channel.trigger('app:module', appName);
            currentApp.start(args);
        }

        return true;
    };

    // Returns current app
    Radio.reply('global', 'app:current', function() {
        return App.currentApp;
    });

    // @ToMove somewhere else
    App.channel.on('app:start', function() {
        $('.-loading').removeClass('-loading');
    });

    Radio.reply('global', 'device', function(method) {
        return Device[method]();
    });

    Radio.reply('global', 'platform', function() {
        return env.platform;
    });

    Radio.reply('global', 'use:webworkers', function() {
        return env.useWorkers;
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
