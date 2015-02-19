/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
], function(_, $, Radio, Marionette) {
    'use strict';

    /**
     * This class is used to add and execute asynchronous initializers.
     * It is very convenient when writing modules or writing sub apps.
     * Also it ensures that every module or sub app is ready
     * before the app starts.
     *
     * App initializers will be executed first. Then, module initializers.
     *
     * Adding new initializers:
     * Radio.channel('init').command('add:app', function() {});
     * Radio.channel('init').command('add:module', function() {});
     *
     * Executing initializers
     * Radio.channel('init').request('start', '{module|app}', args);
     */
    var Initializers = Marionette.Object.extend({

        initialize: function() {
            this._moduleInits = $.Deferred();
            this._appInits    = $.Deferred();

            Radio.channel('init')
            .comply('add:app', this.addAppInit, this)
            .comply('add:module', this.addModuleInit, this)
            .reply('start', this.executeInits, this);
        },

        addAppInit: function(initializer) {
            this._appInits.done(initializer);
        },

        addModuleInit: function(initializer) {
            this._moduleInits.done(initializer);
        },

        /**
         * Executes all the initializers
         */
        executeInits: function(type, args) {
            args = Array.prototype.slice.call(arguments, 1);

            // Resolve the initializers promise
            this['_' + type + 'Inits'].resolveWith(this, args);

            // Trigger an event
            Radio.trigger('global', type + ':ready');
        }

    });

    return new Initializers();
});
