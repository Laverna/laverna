/* global define */
define([
    'underscore',
    'marionette',
    'text!apps/settings/show/templates/profiles.html'
], function (_, Marionette, Tmpl) {
    'use strict';

    var Profiles = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            profileName: '#profileName'
        },

        events: {
            'keypress @ui.profileName': 'createProfile',
            'click .removeProfile': 'removeProfile'
        },

        collectionEvents: {
            'change': 'render'
        },

        removeProfile: function (e) {
            this.collection.trigger('remove:profile', $(e.currentTarget).attr('data-profile'));
            e.preventDefault();
        },

        createProfile: function (e) {
            if (e.which === 13) {
                e.preventDefault();
                this.collection.trigger('create:profile', this.ui.profileName.val());
            }
        },

        serializeData: function () {
            return this.collection.getConfigs();
        }
    });

    return Profiles;
});
