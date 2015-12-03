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
    'backbone.radio',
    'marionette',
    'text!modules/fuzzySearch/templates/item.html'
], function(_, Radio, Marionette, Tmpl) {
    'use strict';

    /**
     * Item view
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'list-group list--group',

        events: {
            'click .list-group-item': 'triggerSearch'
        },

        triggerSearch: function() {
            this.trigger('navigate:search');
        },

        templateHelpers: function() {
            return {
                // Generate link
                link: function() {
                    return Radio.request('uri', 'link', {
                        filter : 'search',
                        query  : encodeURIComponent(this.title)
                    }, this);
                }
            };
        }
    });

    return View;

});
