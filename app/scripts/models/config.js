/*global define*/
define([
    'underscore',
    'backbone',
    'sjcl'
], function (_, Backbone, sjcl) {
    'use strict';

    var Config = Backbone.Model.extend({
        idAttribute: 'name',

        defaults: {
            // 'id'    : undefined,
            'name'  : '',
            'value' : ''
        },

        validate: function (attrs) {
            var errors = [];

            if (attrs.name === '') {
                errors.push('name');
            }
            /*if (attrs.value === '') {
                errors.push('value');
            }*/

            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function () {
            this.on('change', this.hashPassword);

            if (this.get('name') === 'encrypt') {
                this.set('value', parseInt(this.get('value'), 10));
            }
        },

        /**
         * Password should be saved only in hashed form
         */
        hashPassword: function () {
            var hash;
            if (this.get('name') !== 'encryptPass' || this.pwdHashed ||
                typeof this.get('value') === 'object') {
                this.pwdHashed = false;
                return;
            }

            hash = sjcl.hash.sha256.hash(this.get('value'));
            this.set('value', hash);
            this.pwdHashed = true;
        }

    });

    return Config;

});
