/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'i18next',
    'app'
], function(_, $, Marionette, i18n, App) {
    'use strict';

    /**
     * Overrites renderer in order to have access to
     * i18next function in templates
     */
    var render = Marionette.Renderer.render;

    Marionette.Renderer.render = function(template, data) {
        data = _.extend(data, { i18n: $.t });

        return render(template, data);
    };

    /**
     * Init i18next
     */
    App.addInitializer(function() {
        i18n.init({
            lng             : App.settings.appLang,
            fallbackLng     : 'en',
            useCookie       : false,
            useLocalStorage : false
        }, function() {
            App.vent.trigger('i18n:ready', i18n.lng());
        });
    });
});
