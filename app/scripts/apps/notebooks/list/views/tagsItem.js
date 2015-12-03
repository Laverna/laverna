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
    'backbone.radio',
    'apps/notebooks/list/behaviors/itemBehavior',
    'text!apps/notebooks/list/templates/tagsItem.html'
], function(_, Marionette, Radio, ItemBehavior, Tmpl) {
    'use strict';

    /**
     * Tags item view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'list--group list-group',

        behaviors: {
            ItemBehavior: {
                behaviorClass: ItemBehavior
            }
        },

        serializeData: function() {
            return _.extend(this.model.toJSON(), {
                uri : Radio.request('uri', 'link:profile', '')
            });
        }
    });

    return View;
});
