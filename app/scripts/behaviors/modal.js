/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
