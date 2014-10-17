/* global define */
define([
    'marionette'
], function(Marionette) {
    'use strict';

    /**
     * Typical behaviors of modal views
     */
    var ModalBehavior = Marionette.Behavior.extend({
        initialize: function() {
            this.view.on('hidden.modal', this.redirect, this);
        },

        /**
         * Triggers redirect event when it's closed
         */
        redirect: function() {
            this.view.trigger('redirect');
        }
    });

    return ModalBehavior;
});
