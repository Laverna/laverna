/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'Mousetrap',
    'marionette',
    'bootstrap'
], function (_, $, Backbone, Mousetrap) {
    'use strict';

    /**
     * Modal region
     * @source: http://lostechies.com/derickbailey/2012/04/17/managing-a-modal-dialog-with-backbone-and-marionette/
     */
    var ModalRegion = Backbone.Marionette.Region.extend({
        el: '#modal',

        constructor: function() {
            this.$window = $(window);
            _.bindAll(this, 'showModal');
            Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
            this.on('show', this.showModal, this);
        },

        getEl: function(selector) {
            var $el = $(selector);
            $el.on('hidden', this.reset);
            return $el;
        },

        showModal: function(view) {
            this.view = view;

            view.on('destroy', this.hideModal, this);

            Mousetrap.bind('esc', function () {
                view.trigger('destroy');
                return false;
            });

            // Show modal window
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

            // If url is changed we should close modal window
            if (view.hashChange === undefined && this.modalShown === true) {
                this.$window.on('hashchange.modal', function () {
                    view.trigger('destroy');
                });
            }
        },

        hideModal: function () {
            this.modalShown = false;
            this.view.$el.modal('hide');
        }

    });

    return ModalRegion;
});
