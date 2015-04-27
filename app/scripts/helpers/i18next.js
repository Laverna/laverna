/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'backbone.radio',
    'i18next'
], function(_, $, Marionette, Radio, i18n) {
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
    Radio.command('init', 'add', 'app:before', function() {
        return i18n.init({
            lng             : Radio.request('configs', 'get:config', 'appLang'),
            fallbackLng     : 'en',
            useCookie       : false,
            useLocalStorage : false
        });
    });
});
