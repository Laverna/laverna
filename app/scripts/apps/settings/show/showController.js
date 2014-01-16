/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'collections/configs',
    'collections/notes',
    'collections/notebooks',
    'models/config',
    'apps/settings/show/showView', 'apps/settings/show/encryptView'
], function (_, App, Marionette, Configs, Notes, Notebooks, Config, View, EncryptView) {
    'use strict';

    var Show = App.module('AppSettings.Show');

    /**
     * Settings controller
     */
    Show.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show', 'showModal');

            this.configs = new Configs();
            this.configs.fetch();

            this.configs.on('changeSetting', this.save, this);
        },

        show : function () {
            this.notes = new Notes();
            this.notebooks = new Notebooks();

            $.when(this.notes.fetch(), this.notebooks.fetch()).done(this.showModal);
        },

        showModal: function () {
            var view = new View({ collection : this.configs });
            App.modal.show(view);

            view.on('redirect', this.redirect, this);
            view.on('encryption', this.encryption, this);
        },

        encryption: function (args) {
            if (args.encrypt === true) {
                var modal = new EncryptView({
                    notes: this.notes,
                    notebooks: this.notebooks
                });

                if (args.oldConfigs.encrypt === 0) {
                    App.brand.show(modal);

                    this.encrypt(args.secureKey);
                } else if (args.setChange === true) {
                    App.brand.show(modal);

                    this.recrypt(args.secureKey);
                }
            }
        },

        encrypt: function (key) {
            this.notes.encrypt(this.configs.getConfigs(), key);
            this.notebooks.settingsEncrypt();
        },

        recrypt: function (key) {
            var ok = this.notes.decrypt();
            var ok2 = this.notebooks.settingsDecrypt();

            if ( (ok.length > 0) && (ok2.length > 0) )  {
                this.notes.reset(ok);
                this.notebooks.reset(ok2);

                this.encrypt(key);
            }
        },

        save: function (setting) {
            var model = this.configs.get(setting.name);
            model.save({
                value : setting.value
            });
        },

        redirect: function (changedSettings) {
            App.navigateBack();
            if (changedSettings && changedSettings.length !== 0) {
                window.location.reload();
            }
        }

    });

    return Show.Controller;
});
