/*global define*/
define([
    'underscore',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/settings/show/showTemplate.html',
    'sjcl'
], function (_, App, $, Backbone, Marionette, Tmpl, sjcl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        ui: {
            saltInput : 'input[name=encryptSalt]',
            importBtn : '#do-import',
            exportBtn : '#do-export',
            importFile: '#import-file',
            profileName: '#profileName'
        },

        events: {
            'click .ok'               : 'save',
            'click .close'            : 'close',
            'click .showField'        : 'clickCheckbox',
            'click #randomize'        : 'randomize',
            'submit .form-horizontal' : 'save',
            'change input, select, textarea' : 'triggerChange',
            'click @ui.importBtn'     : 'importTrigger',
            'click @ui.exportBtn'     : 'exportTrigger',
            'change @ui.importFile'   : 'importFile',
            'keypress @ui.profileName'   : 'createProfile',
            'click .removeProfile': 'removeProfile'
        },

        initialize: function () {
            this.changedSettings = [];

            this.on('hidden.modal', this.redirect);
            this.on('shown.modal', this.changeTab);
            this.listenTo(this.collection, 'change', this.renderAgain);
        },

        renderAgain: function () {
            var tab = this.$('li.active a').attr('href').replace('#', '');
            this.render();
            this.changeTab(tab);
        },

        changeTab: function (tab) {
            tab = (typeof tab === 'string' && tab !== '') ? tab : this.options.args.tab;
            this.$('.modal-header ul a[href="#' + tab + '"]').click();
        },

        removeProfile: function (e) {
            this.collection.trigger('remove:profile', $(e.currentTarget).attr('data-profile'));
            e.preventDefault();
        },

        createProfile: function (e) {
            if (e.which === 13) {
                e.preventDefault();
                this.collection.trigger('create:profile', this.ui.profileName.val());
            }
        },

        triggerChange: function (e) {
            var el = $(e.target);
            this.changedSettings.push(el.attr('name'));
        },

        serializeData: function () {
            return {
                models: this.collection.getConfigs()
            };
        },

        importFile: function (e) {
            this.trigger('import', e.target);
        },

        exportTrigger: function () {
            this.trigger('export');
        },

        importTrigger: function () {
            this.ui.importFile.click();
        },

        randomize: function () {
            var random = sjcl.random.randomWords(2, 0);
            this.ui.saltInput.val(random);
            this.changedSettings.push(this.ui.saltInput.attr('name'));
            return false;
        },

        /**
         * Shows fieldsets with aditional parameters
         */
        clickCheckbox: function ( e ) {
            var input = $(e.currentTarget),
                field = $(input.attr('data-field'));

            if ( input.is(':checked') ) {
                field.removeClass('hidden');
            } else {
                field.addClass('hidden');
            }
        },

        /**
         * Save the configs changes
         */
        save: function () {
            var values = {},
                el;

            this.changedSettings = _.uniq(this.changedSettings);

            _.each(this.changedSettings, function (settingName, iter) {
                el = this.$('[name=' + settingName + ']');
                values[settingName] = { name: settingName };

                if (el.attr('type') !== 'checkbox') {
                    values[settingName].value = el.val();
                }
                else {
                    values[settingName].value = (el.is(':checked')) ? 1 : 0;
                }

                if (iter === (this.changedSettings.length - 1)) {
                    this.collection.trigger('changeSettings', values);
                }

            }, this);

            this.somethingChanged = true;
            this.close();
            return false;
        },

        redirect: function () {
            var args = [];
            if (this.somethingChanged === true) {
                args = this.changedSettings;
            }
            this.trigger('redirect', args);
        },

        close: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('close');
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
