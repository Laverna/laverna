/* global define */
define([
    'underscore',
    'marionette',
    'constants',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/sync.html'
], function(_, Marionette, constants, FormBehavior, Tmpl) {
    'use strict';

    /**
     * Sync settings.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior
            }
        },

        serializeData: function() {
            return {
                models         : this.collection.getConfigs(),
                dropboxKeyNeed : constants.DROPBOXKEYNEED
            };
        }
    });

    return View;
});
