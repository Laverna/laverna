/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'marionette',
    'text!apps/notes/form/templates/link.html'
], function (_, $, App, Backbone, Marionette, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        focusEl: '#link-insert',

        ui: {
            'link': '#link-insert'
        },

        initialize: function () {
            this.link = null;
            this.on('shown.modal', this.bindEvents, this);
        },

        bindEvents: function () {
            var self = this;

            this.ui.link = $('#link-insert');
            this.ui.link.on('change', function () {
                self.setLink();
            });
        },

        setLink: function () {
            this.link = this.ui.link.val();
        },

        templateHelpers: function() {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
