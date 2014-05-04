/*global define*/
define([
    'underscore',
    'marionette',
    'app'
], function (_, Marionette, App) {
    'use strict';

    var ModelEncrypt = function () {
        // Old configs from Application cache
        this.oldConfigs = App.settings;
    };

    _.extend(ModelEncrypt.prototype, {

        initialize: function (args) {
            this.configs = args.configs;
            this.notes = args.notes;
            this.notebooks = args.notebooks;

            this.encrypt();
        },

        encrypt: function () {
            // This is probably the first encryption
            if (this.oldConfigs.encrypt === 0 && this.oldConfigs.secureKey === '') {
                this.firstEncryption();
            }
            // Some (or all) of encryption's settings has been changed
            else if (this.isSettingsChanged() === true) {
                this.reEncryption();
            }
            // User disabled encryption - unencrypt all data
            else if (this.oldConfigs.encrypt === 1 && this.configs.encrypt === 0) {
                this.decryption();
            }
            // User just re enabled encryption
            else if (this.oldConfigs.encrypt === 0) {
                this.encryptOnlyNew();
            }
        },

        // Returns true if any of encryption's settings has been changed
        // ----------------------------
        isSettingsChanged: function () {
            var encrSet = ['encryptPass', 'encryptSalt', 'encryptIter', 'encryptTag', 'encryptKeySize'],
                changed = false;

            _.each(encrSet, function (set) {
                if (typeof(this.configs[set]) !== 'object' &&
                    this.configs[set] !== this.oldConfigs[set]) {
                    changed = true;
                } else if (this.configs[set].toString() !== this.oldConfigs[set].toString()) {
                    changed = true;
                }
            }, this);

            return changed;
        },

        // First kiss :)
        // ------------
        firstEncryption: function () {
            App.log('First encryption');
            this.encryptNotes();
            this.encryptNotebooks();
        },

        // User re enabled encryption but does not change any of settings
        // -------------------------
        encryptOnlyNew: function () {
            App.log('You\'re enabled encryption again');

            // Filter data
            this.notes.reset(this.notes.getUnEncrypted());
            this.notebooks.reset(this.notebooks.getUnEncrypted());

            // Encrypt
            this.encryptNotes();
            this.encryptNotebooks();
        },

        // Encryption settings is changed decrypt and encrypt all data
        // ------------------------
        reEncryption: function () {
            App.log('You changed some of encryption settings');
            App.settings.encrypt = 1;
            this.encryptNotes();
            this.encryptNotebooks();
        },

        // No need of encryption - decrypt all the data
        // ----------------------
        decryption: function () {
            App.log('Decryption');
            this.encryptNotes();
            this.encryptNotebooks();
        },

        encryptNotes: function () {
            var self = this,
                data;

            this.notes.each(function (note) {
                data = {};

                // Try to decrypt data
                App.settings = self.oldConfigs;
                data.title = App.Encryption.API.decrypt(note.get('title'));
                data.content = App.Encryption.API.decrypt(note.get('content'));

                // Encrypt
                App.settings = self.configs;
                data.title = App.Encryption.API.encrypt(data.title);
                data.content = App.Encryption.API.encrypt(data.content);

                // Save
                note.trigger('update:any');
                note.save(data, {
                    success: function () {
                        self.notes.trigger('progressEncryption');
                    }
                });
            });
        },

        encryptNotebooks: function () {
            var self = this,
                data;

            this.notebooks.each(function (note) {
                data = {};

                // Try to decrypt data
                App.settings = self.oldConfigs;
                data.name = App.Encryption.API.decrypt(note.get('name'));

                // Encrypt
                App.settings = self.configs;
                data.name = App.Encryption.API.encrypt(data.name);

                // Save
                note.save(data, {
                    success: function () {
                        self.notebooks.trigger('progressEncryption');
                    }
                });
            });
        }

    });

    return ModelEncrypt;
});
