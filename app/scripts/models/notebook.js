/*global define*/
// /*global sjcl*/
define([
    'underscore',
    'backbone',
    'migrations/notebooks',
    'backbone.assosiations',
    'indexedDB',
    'sjcl'
], function (_, Backbone, NotebooksDB) {
    'use strict';

    // var Model = Backbone.Model.extend({
    //AssociatedModel
    var Model = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

        database: NotebooksDB,
        storeName: 'notebooks',

        defaults: {
            'id'       :  0,
            'parentId' :  0,
            'name'     :  '',
            'notes'    :  [],
            'count'    :  0
        },

        validate: function (attrs) {
            var errors = [];
            if (attrs.name === '') {
                errors.push('name');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function () {
            this.on('removed:note', this.removeCount);
            this.on('add:note', this.addCount);

            // if (this.collection !== undefined) {
            //     var encryptionData = this.collection.getEncryptionData();
            //     if (encryptionData.configs.get('encrypt').get('value') === 1) {
            //         try {
            //             this.attributes.name = sjcl.decrypt(encryptionData.key, this.attributes.name);
            //         } catch (err) {}
            //     }
            // }

        },

        addCount: function () {
            this.save({
                'count': this.get('count') + 1
            });
        },

        removeCount: function () {
            this.save({
                'count': this.get('count') - 1
            });
        },

        /**
         * Decrypting data
         */
        decrypt: function ( configs ) {
            var data = this.toJSON();

            if (configs.encrypt === 1 && data.name !== '') {
                data.name = sjcl.decrypt(configs.secureKey, data.name);
            }

            return data;
        }
    });

    return Model;
});
