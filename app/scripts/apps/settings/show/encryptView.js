/* global define */
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/settings/show/encryptTemplate.html'
], function (_, $, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            state: '#state'
        },

        initialize: function () {
            var count = this.options.notes.length + this.options.notebooks.length;
            this.now = 0;

            if (this.options.mode === 'recrypt') {
                this.max = count * 2;
            } else {
                this.max = count;
            }

            this.options.notes.on('progressEncryption', this.progress, this);
            this.options.notebooks.on('progressEncryption', this.progress, this);
        },

        progress: function () {
            this.now++;
            this.$('#progress').css('width', ((this.now * 100) / this.max) + '%' );
            if (this.now === this.max) {
                this.$('#progress').css('width', '100%' );
                this.trigger('close');
            }
        },

        serializeData: function () {
            return {
                max: this.max
            };
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
