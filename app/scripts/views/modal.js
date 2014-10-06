/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'Mousetrap',
    'bootstrap'
], function (_, $, Marionette, Mousetrap) {
    'use strict';

    /**
     * Modal region
     * @source: http://lostechies.com/derickbailey/2012/04/17/managing-a-modal-dialog-with-backbone-and-marionette/
     */
    var ModalRegion = Marionette.Region.extend({
        el: '#modal',

        initialize: function () {
            this.$window = $(window);
        },

        onShow: function (view) {
            view.$el.modal({
                show     : true,
                backdrop : 'static',
                keyboard : false
            });

            // Trigger shown event
            view.$el.on('shown.bs.modal', function () {
                view.trigger('shown.modal');
            });

            // Trigger hidden event
            view.$el.on('hidden.bs.modal', function () {
                view.trigger('hidden.modal');
            });

            // Hide on close event
            view.on('close', function () {
                view.$el.modal('hide');
            });

            // Close on ESC
            Mousetrap.bind('esc', function () {
                view.$el.modal('hide');
            });

            // If url is changed we should close modal window
            if (view.stayOnHashchange !== true) {
                this.$window.on('hashchange.modal', function () {
                    view.$el.modal('hide');
                });
            }
        },

        onBeforeEmpty: function (view) {
            view.$el.modal('hide');
            this.onBeforeSwap();
        },

        /**
         * Because sometimes backdrop is duplicated
         */
        onBeforeSwap: function () {
            var backdrop = $('.modal-backdrop');
            if (backdrop.length) {
                backdrop.remove();
            }
            this.$window.off('hashchange.modal');
        }

    });

    return ModalRegion;
});
