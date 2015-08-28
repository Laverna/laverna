/*global define*/
define([
    'underscore',
    'backbone',
    'sjcl',
    'migrations/note',
    'indexedDB'
], function(_, Backbone, sjcl, DB) {
    'use strict';

    var Config = Backbone.Model.extend({
        idAttribute: 'name',

        database  : DB,
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
            this.database = _.extend({}, this.database);
            this.database.id = id;
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
