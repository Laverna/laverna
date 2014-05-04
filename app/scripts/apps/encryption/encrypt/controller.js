/*global define*/
define([
    'underscore',
    'marionette',
    'app',
    'helpers/uri',
    'collections/configs',
    'collections/notes',
    'collections/notebooks',
    'apps/encryption/encrypt/modelEncrypt',
    'apps/encryption/encrypt/encryptView'
], function (_, Marionette, App, URI, Configs, Notes, Notebooks, ModelEncrypt, EncryptView) {
    'use strict';

    /**
     * After every change of encryption settings this module will encrypt
     * all notes and notebooks
     */
    var EncryptAll = App.module('Encryption.EncryptAll');

    EncryptAll.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'showEncrypt', 'showProgress');

            App.settings.secureKey = App.secureKey;
            this.configs = new Configs();
            this.configs.fetch();
            this.configs = this.configs.getConfigs();

            this.notes = new Notes();
            this.notebooks = new Notebooks();
        },

        showEncrypt: function (db) {
            // Switch to another database
            db = ( !db ? 'notes-db' : db);
            this.notes.database.getDB(db);
            this.notebooks.database.getDB(db);

            $.when(this.notes.fetch(), this.notebooks.fetch()).done(this.showProgress);
        },

        showProgress: function () {
            this.oldPassNull = true;
            if ( !App.secureKey && App.settings.encryptPass !== '') {
                this.oldPassNull = false;
            }

            // View which shows progress of encryption
            var view = new EncryptView({
                notes     : this.notes,
                notebooks : this.notebooks,
                oldPass   : this.oldPassNull
            });

            view.on('checkPasswords', this.checkPasswords, this);
            view.on('redirect', this.redirect, this);

            // Show progress
            App.brand.show(view);
        },

        redirect: function () {
            var db = _.indexOf(this.configs.appProfiles, this.notes.database.id) + 1,
                uri;

            // Go encrypt data from another profile
            if (this.configs.appProfiles[db]) {
                App.settings = this.settingsOld;
                uri = '/encrypt/all/' + this.configs.appProfiles[db];
                App.navigate(URI.link(uri), true);
            }
            // Reload the page
            else {
                App.navigate(URI.link('/notes'), false);
                window.location.reload();
            }
        },

        encrypt: function () {
            this.settingsOld = App.settings;

            new ModelEncrypt().initialize({
                configs   : this.configs,
                notes     : this.notes,
                notebooks : this.notebooks
            });
        },

        checkPasswords: function (args) {
            var oldConfigs = App.settings,
                oldKey,
                newKey;

            App.settings = this.configs;
            newKey = App.Encryption.API.encryptKey(args.newPass);

            if (newKey !== false) {
                this.configs.secureKey = newKey;
            }

            App.settings = oldConfigs;
            // Old secure key isn't in cache
            if (this.oldPassNull === false) {
                oldKey = App.Encryption.API.encryptKey(args.oldPass);
                if (oldKey !== false) {
                    App.settings.secureKey = oldKey;
                }
            }

            // If no encryption settings changed
            if (_.difference(oldConfigs, this.configs).length === 0 && oldConfigs.encryptPass !== '') {
                this.redirect();
                return false;
            }

            if (newKey !== false && App.settings.secureKey !== false) {
                this.encrypt();
            }
        }

    });

    return EncryptAll.Controller;

});
