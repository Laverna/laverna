/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'behaviors/modalForm',
    'text!apps/notebooks/form/tag/templates/form.html'
], function(_, Marionette, ModalForm, Templ) {
    'use strict';

    /**
     * Tag form view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'modal fade',

        ui: {
            name : 'input[name="name"]'
        },

        behaviors: {
            ModalForm: {
                behaviorClass: ModalForm
            }
        }
    });

    return View;
});
