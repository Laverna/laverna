/*global define*/
define([
    'underscore',
    'backbone',
    'models/config',
    'localStorage'
], function (_, Backbone, Config) {
    'use strict';

    var Configs = Backbone.Collection.extend({

        localStorage: new Backbone.LocalStorage('vimarkable.configs'),
        store : 'configs',

        model : Config,

        /**
         * Creates default set of configs
         */
        firstStart: function () {
            // Basic
            this.create(new Config({ name: 'appVersion', value: '0.5.0' }));
            this.create(new Config({ name: 'appLang', value: '' }));
            this.create(new Config({ name: 'cloudStorage', value: '0' }));
            this.create(new Config({ name: 'pagination', value: '10' }));
            this.create(new Config({ name: 'editMode', value: 'preview' }));

            // Encryption
            this.create(new Config({ name: 'encrypt', value: '0' }));
            this.create(new Config({ name: 'encryptPass', value: '' }));
            this.create(new Config({ name: 'encryptSalt', value: '' }));
            this.create(new Config({ name: 'encryptIter', value: '1000' }));
            this.create(new Config({ name: 'encryptTag', value: '64' }));
            this.create(new Config({ name: 'encryptKeySize', value: '128' }));

            // Shortcuts. Navigation
            this.create(new Config({ name: 'navigateTop', value: 'k' }));
            this.create(new Config({ name: 'navigateBottom', value: 'j' }));

            // Shortcuts. Jumping
            this.create(new Config({ name: 'jumpInbox', value: 'g i' }));
            this.create(new Config({ name: 'jumpNotebook', value: 'g n' }));
            this.create(new Config({ name: 'jumpFavorite', value: 'g f' }));
            this.create(new Config({ name: 'jumpRemoved', value: 'g t' }));

            // Shortcuts. Actions
            this.create(new Config({ name: 'actionsEdit', value: 'e' }));
            this.create(new Config({ name: 'actionsOpen', value: 'o' }));
            this.create(new Config({ name: 'actionsRemove', value: 'shift+3' }));
            this.create(new Config({ name: 'actionsRotateStar', value: 's' }));

            // Shortcuts. Application
            this.create(new Config({ name: 'appCreateNote', value: 'c' }));
            this.create(new Config({ name: 'appSearch', value: '/' }));
            this.create(new Config({ name: 'appKeyboardHelp', value: '?' }));
        },

        getConfigs: function () {
            var data = {};

            _.forEach(this.models, function ( model ) {
                data[model.get('name')] = model.get('value');
            });

            return data;
        }

    });

    return Configs;

});
