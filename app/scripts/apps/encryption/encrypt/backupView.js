/* global define */
define([
    'underscore',
    'marionette',
    'text!apps/encryption/encrypt/backup.html'
], function(_, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        triggers: {
            'click #btn--download': 'confirm:download',
            'click #btn--next'    : 'next:step'
        }
    });

    return View;

});
