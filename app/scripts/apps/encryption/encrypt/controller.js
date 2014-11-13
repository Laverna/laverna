/*global define*/
define([
    'underscore',
    'marionette',
    'app',
    'helpers/uri',
    'collections/configs',
    'collections/notes',
    'collections/notebooks',
    'apps/encryption/auth',
    'apps/encryption/encrypt/modelEncrypt',
    'apps/encryption/encrypt/encryptView'
], function (_, Marionette, App, URI, Configs, Notes, Notebooks, getAuth, getEncrypt, EncryptView) {
    'use strict';

    /**
     * After every change of encryption settings this module will encrypt
     * all notes and notebooks
     */
    var EncryptAll = App.module('Encryption.EncryptAll');

    EncryptAll.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'showEncrypt', 'show');

            // New settings
            this.configs = new Configs();
            this.configs.fetch();
            this.configs = this.configs.getConfigs();

            this.notes = new Notes();
            this.notebooks = new Notebooks();

            // Initialize encryption model
            this.encrypt = getEncrypt(this.configs, App.settings);
        },

        showEncrypt: function (db) {
            db = ( !db ? 'notes-db' : db);
            this.notes.database.getDB(db);
            this.notebooks.database.getDB(db);

            $.when(this.notes.fetch(), this.notebooks.fetch()).then(this.show);
        },

        show: function () {
            var passwords = {},
                encrypt = Number(this.configs.encrypt),
                encryptOld = Number(App.settings.encrypt);

            // Encryption: disabled
            if (encryptOld === 1 && encrypt === 0) {
                passwords.old = _.isUndefined(this.encrypt.configsOld.secureKey);
            }
            // Encryption: enabled
            else if (encryptOld === 0 && encrypt === 1) {
                passwords.new = _.isUndefined(this.encrypt.configs.secureKey);
            }
            // Encryption settings: changed
            else if(encryptOld === 1 && encrypt === 1) {
                passwords.old = _.isUndefined(this.encrypt.configsOld.secureKey);
                passwords.new = _.isUndefined(this.encrypt.configs.secureKey);
            }

            this.view = new EncryptView({
                notes     : this.notes,
                notebooks : this.notebooks,
                passwords : passwords
            });

            App.brand.show(this.view);

            this.view.on('checkPasswords', this.checkPasswords, this);

            if (passwords.old === false || passwords.new === false) {
                this.checkPasswords(passwords);
            }
        },

        checkPasswords: function (passwords) {
            var password,
                configs,
                i = 0;

            for (var key in passwords) {
                configs = (key === 'new' ? 'configs' : 'configsOld');
                password = this.encrypt.checkPassword(passwords[key], configs);

                if (password === false) {
                    this.view.trigger('password:wrong', password);
                    break;
                }

                i++;
                if (i === _.keys(passwords).length) {
                    this.encryptInit();
                }
            }
        },

        /**
         * Initialize encryption progress
         */
        encryptInit: function () {
            var self = this;
            $.when(
                this.encrypt.initialize([
                    this.notes, this.notebooks
                ])
            ).then(function () {
                self.redirect();
            });
        },

        redirect: function () {
            var db = _.indexOf(this.configs.appProfiles, this.notes.database.id) + 1,
                uri;

            // Go encrypt data from another profile
            if (this.configs.appProfiles[db]) {
                uri = '/encrypt/all/' + this.configs.appProfiles[db];
                App.vent.trigger('navigate:link', uri);
            }
            // Reload the page
            else {
                App.vent.trigger('navigate:link', '/notes', false);
                window.location.reload();
            }
        }

    });

    return EncryptAll.Controller;

});
