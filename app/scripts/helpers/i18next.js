/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'i18next'
], function (_, $, Marionette) {
    'use strict';

    /**
     * Overrites renderer in order to have access to
     * i18next function in templates
     */
    var render = Marionette.Renderer.render;

    Marionette.Renderer.render = function (template, data) {
        data = _.extend(data, { i18n: $.t });

        return render(template, data);
    };
});
