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
    'text!apps/settings/show/templates/profiles.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Show, add, remove profiles
     */
    var Profiles = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            profile : '#profileName'
        },

        events: {
            'keypress @ui.profile' : 'createProfile',
            'click .removeProfile' : 'removeProfile'
        },

        initialize: function() {
            this.listenTo(this.options.profiles, 'change', this.render);
        },

        removeProfile: function(e) {
            this.trigger('remove:profile', $(e.currentTarget).attr('data-profile'));
            return false;
        },

        createProfile: function(e) {
            if (e.which === 13) {
                e.preventDefault();
                this.trigger('create:profile', this.ui.profile.val().trim());
                this.ui.profile.val('').blur();
            }
        },

        serializeData: function() {
            return {
                appProfiles: this.options.profiles.getValueJSON()
            };
        }
    });

    return Profiles;
});
