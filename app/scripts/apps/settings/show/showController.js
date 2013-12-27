/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'collections/configs',
    'apps/settings/show/showView'
], function (_, App, Marionette, Configs, View) {
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

            this.configs.on('changeSetting', this.save, this);
        },

        show : function () {
            var view = new View({ collection : this.configs });
            App.modal.show(view);
            view.on('redirect', this.redirect, this);
        },

        save: function (setting) {
            var model = this.configs.get(setting.name);
            model.save({
                value : setting.value.trim()
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
