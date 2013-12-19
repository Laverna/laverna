/*global define*/
// /*global sjcl*/
define([
    'underscore',
    'backbone',
    'backbone.assosiations',
    'sjcl'
], function (_, Backbone) {
    'use strict';

    // var Model = Backbone.Model.extend({
    //AssociatedModel
    var Model = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

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

            /*if (this.collection !== undefined) {
                var encryptionData = this.collection.getEncryptionData();
                if (encryptionData.configs.encrypt === 1) {
                    try {
                        this.attributes.name = sjcl.decrypt(encryptionData.key, this.attributes.name);
                    } catch (err) {}
                }
            }*/

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
        }
    });

    return Model;
});
