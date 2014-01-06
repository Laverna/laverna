/*global define*/
/*global sjcl*/
define([
    'underscore',
    'backbone',
    'sjcl'
], function (_, Backbone) {
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
        },

        /**
         * Password should be saved only in hashed form
         */
        hashPassword: function () {
            if (this.get('name') !== 'encryptPass' || this.pwdHashed) {
                this.pwdHashed = false;
                return;
            }

            var hash = sjcl.hash.sha256.hash(this.get('value'));
            this.set('value', hash);
            this.pwdHashed = true;
        }

    });

    return Config;

});
