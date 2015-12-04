/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/modal',
    'text!apps/help/about/template.html'
], function (_, $, Marionette, ModalBehavior, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        behaviors: {
            ModalBehavior: {
                behaviorClass: ModalBehavior
            }
        },

        serializeData: function () {
            return {
                appVersion : this.options.appVersion
            };
        }
    });

    return View;
});
