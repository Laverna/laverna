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
         * Password should be saved only in hashed form
         */
        hashPassword: function() {
            var hash;
            if (this.get('name') !== 'encryptPass' || this.pwdHashed ||
                typeof this.get('value') === 'object') {
                this.pwdHashed = false;
                return;
            }

            hash = sjcl.hash.sha256.hash(this.get('value'));
            this.set('value', hash);
            this.pwdHashed = true;
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
        }

    });

    return Config;

});
