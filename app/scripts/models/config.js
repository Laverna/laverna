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
    'backbone'
], function(_, Backbone) {
    'use strict';

    var Config = Backbone.Model.extend({
        idAttribute: 'name',

        profileId : 'notes-db',
        storeName : 'configs',

        defaults: {
            'name'  : '',
            'value' : ''
        },

        validate: function(attrs) {
            var errors = [];

            if (attrs.name === '') {
                errors.push('name');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        /**
         * Switch to another profile
         */
        changeDB: function(id) {
            this.profileId = id;
        },

        /**
         * Parse the value of a model
         */
        getValueJSON: function() {
            return JSON.parse(this.get('value'));
        },

        createProfile: function(name) {
            if (!name) {
                return;
            }

            var value = JSON.parse(this.get('value'));

            if (_.contains(value, name) === false) {
                value.push(name);
                return this.save({value: JSON.stringify(value)});
            }
        },

        removeProfile: function(name) {
            if (!name) {
                return;
            }

            var value = JSON.parse(this.get('value'));

            if (_.contains(value, name) === true) {
                value = _.without(value, name);
                window.indexedDB.deleteDatabase(name);
                return this.save({value: JSON.stringify(value)});
            }
        },

        /**
         * @return bool
         */
        isPassword: function(data) {
            return (
                (
                    this.get('name') === 'encryptPass' || data.name === 'encryptPass'
                ) &&
                (
                    typeof data.value !== 'object' &&
                    data.value !== this.get('value').toString()
                )
            );
        }

    });

    return Config;

});
