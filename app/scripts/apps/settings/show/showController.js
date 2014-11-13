/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'marionette',
    'fileSaver',
    'collections/configs',
    'apps/settings/show/views/showView'
], function (_, $, App, Marionette, saveAs, Configs, View) {
    'use strict';

    var Show = App.module('AppSettings.Show');

    /**
     * Settings controller
     */
    Show.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'show');

            this.configs = new Configs();
            this.configs.fetch();

            // Events
            this.configs.on('save:all', this.saveAll, this);
            this.configs.on('create:profile', this.createProfile, this);
            this.configs.on('remove:profile', this.removeProfile, this);

            // Import & export events
            this.configs.on('import', this.importSettings, this);
            this.configs.on('export', this.exportSettings, this);
        },

        onDestroy: function () {
            this.view.trigger('destroy');
            delete this.view;
        },

        /*
         * Show settings form in modal window
         */
        show : function (args) {
            this.view = new View({
                collection : this.configs,
                args: args
            });

            App.modal.show(this.view);
            this.view.trigger('show:tab');

            this.view.on('redirect', this.redirect, this);
            this.view.on('show:tab', this.onShowTab, this);
        },

        onShowTab: function (args) {
            App.vent.trigger('navigate:link', '/settings/' + args.tab, false);
        },

        /*
         * Create a new profile
         */
        createProfile: function (profile) {
            this.configs.createProfile(profile);
            this.configs.trigger('change:profile');
            App.trigger('configs:fetch');
        },

        /*
         * Remove a profile
         */
        removeProfile: function (profile) {
            var result = window.confirm($.t('Remove profile', {profile: profile}));
            if (result ) {
                this.configs.removeProfile(profile);
                App.trigger('configs:fetch');
            }
        },

        /*
         * Export all settings
         */
        exportSettings: function () {
            var blob = new Blob(
                [JSON.stringify( this.configs )],
                {type: 'text/plain;charset=utf-8'}
            );

            saveAs(blob, 'laverna-settings.json');
        },

        /*
         * Import settings (encryption settings, hashes etc..)
         */
        importSettings: function (data) {
            var reader = new FileReader(),
                self = this,
                settings;

            if (data.length === 0) {
                return;
            }

            reader.onload = function (event) {
                try {
                    settings = JSON.parse(event.target.result);
                    settings = _.extend(settings, {'appVersion' : App.constants.VERSION});
                    self.saveAll(settings);
                }
                catch (error) {
                    throw new Error('File chould be in json format');
                }
            };

            reader.readAsText(data.files[0]);
        },

        saveAll: function (settings) {
            if (settings.length === 0) {
                return this.redirect(settings);
            }

            _.forEach(settings, function (set, iter) {
                this.save(set);

                if (iter === (settings.length - 1)) {
                    this.view.trigger('redirect', settings);
                }
            }, this);
        },

        /*
         * Save new settings
         */
        save: function (setting) {
            var model = this.configs.get(setting.name);
            if (model) {
                return model.save({ value : setting.value });
            }
        },

        /*
         * Navivate back and reload the page
         */
        redirect: function (changedSettings) {
            App.modal.empty();

            if ( this.isEncryptionChanged(changedSettings) === false) {
                App.vent.trigger(
                    'navigate:link',
                    '/notes',
                    { trigger : changedSettings.length === 0 }
                );

                if (changedSettings && changedSettings.length !== 0) {
                    window.location.reload();
                }
            } else {
                App.log('One of encryption\'s settings is changed');
                App.vent.trigger('navigate:link', '/encrypt/all');
            }
        },

        /*
         * Check is any of encryption settings changed
         */
        isEncryptionChanged: function (changedSettings) {
            var encrSet = ['encrypt', 'encryptPass', 'encryptSalt', 'encryptIter', 'encryptTag', 'encryptKeySize'],
                encrypt = parseInt(this.configs.get('encrypt').get('value')),
                changed = false;

            changedSettings = new Configs(changedSettings).getConfigs();
            if ( !_.isEmpty(_.pick(changedSettings, encrSet)) ) {
                changed = true;
            }

            if (encrypt === App.settings.encrypt && encrypt === 0) {
                changed = false;
            }

            return changed;
        }

    });

    return Show.Controller;
});
