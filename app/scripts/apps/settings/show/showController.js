/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'collections/configs',
    'collections/notes',
    'models/config',
    'apps/settings/show/showView'
], function (_, App, Marionette, Configs, Notes, Config, View) {
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

            $.when(this.notes.fetch()).done(this.showModal);
        },

        showModal: function () {
            var view = new View({ collection : this.configs });
            App.modal.show(view);

            //view.on('redirect', this.redirect, this);
            view.on('encryption', this.encryption, this);
        },

        encryption: function (args) {
            if (args.encrypt === true) {
                if (args.oldConfigs.encrypt === 0) {
                    this.encrypt(args.secureKey);
                } else if (args.setChange === true) {
                    this.recrypt(args.secureKey);
                }
            }
        },

        encrypt: function (key) {
            this.notes.encrypt(this.configs.getConfigs(), key);
        },

        recrypt: function (key) {
            var ok = this.notes.decrypt(this.configs.getConfigs(), key);
            console.log(ok);

            if (ok.length > 0) {
                this.notes.reset(ok);
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
