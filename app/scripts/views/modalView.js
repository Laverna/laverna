/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'bootstrap'
], function (_, $, Backbone, Marionette) {
    'use strict';

    Marionette.ModalView = Marionette.ItemView.extend({

        constructor: function () {
            _.bindAll(this);
            Marionette.View.prototype.constructor.apply(this, arguments);
            this.on('show', this.showModal, this);
        },

        showModal: function (view) {
            this.$el.modal('show');
            view.on('close', this.hideModal, this);
        },

        hideModal: function () {
            this.$el.modal('hide');
        },

    });

});
