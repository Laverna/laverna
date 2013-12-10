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

        model : Config,

        firstStart: function () {
            // Basic
            this.create(new Config({ name: 'encryption', value: 0 }));
            this.create(new Config({ name: 'cloud-storage', value: 0 }));
            this.create(new Config({ name: 'pagination-configs', value: 0 }));
            // Shortcuts. Navigation
            this.create(new Config({ name: 'shortcuts-navigation-top', value: 'k' }));
            this.create(new Config({ name: 'shortcuts-navigation-bottom', value: 'j' }));
            // Shortcuts. Jumping
            this.create(new Config({ name: 'shortcuts-jumping-inbox', value: 'g+i' }));
            this.create(new Config({ name: 'shortcuts-jumping-notebook-list', value: 'g+n' }));
            this.create(new Config({ name: 'shortcuts-jumping-favorite-notes', value: 'g+f' }));
            this.create(new Config({ name: 'shortcuts-jumping-removed-notes', value: 'g+t' }));
            // Shortcuts. Actions
            this.create(new Config({ name: 'shortcuts-actions-edit', value: 'e' }));
            this.create(new Config({ name: 'shortcuts-actions-open', value: 'o' }));
            this.create(new Config({ name: 'shortcuts-actions-remove', value: 'shift+3' }));
            this.create(new Config({ name: 'shortcuts-actions-rotate-star', value: 'f' }));
            // Shortcuts. Application
            this.create(new Config({ name: 'shortcuts-application-create-new-note', value: 'c' }));
            this.create(new Config({ name: 'shortcuts-application-search-note', value: '/' }));
            this.create(new Config({ name: 'shortcuts-application-keyboard-help', value: '?' }));
        }

    });

    return Configs;

});
