/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'text!apps/encryption/auth/template.html'
], function (_, $, Marionette, Tmpl) {
    'use strict';

    /**
     * Auth view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        events: {
            'submit .form-wrapper'  : 'login'
        },

        ui: {
            password : 'input[name=password]'
        },

        initialize: function () {
            this.on('shown', this.focusPassword, this);
			this.on('invalid:password', this.wrongPwd, this);
        },

        focusPassword: function () {
            this.ui.password.focus();
        },

        login: function (e) {
            e.preventDefault();
            this.trigger('login', this.ui.password.val());
        },

		wrongPwd: function(){
			// Create the shake function from jQuery-UI
			// without using the whole package
			jQuery.fn.shake = function(duration, shakes, distance) {
			    duration = duration || 10;
			    shakes = shakes || 10;
			    distance = distance || 5;
				this.css('position', 'relative');
				for (var x=1; x<=shakes; x++) {
					this.animate({left:(distance*-1)},(((duration/shakes)/4)))
						.animate({left:distance}, ((duration/shakes)/2))
						.animate({left:0}, (((duration/shakes)/4)));
				}
			return this;
			};

			//Clear password form
			var pwdForm = $('.form-control.input-lg.input--brand');
			pwdForm.val('');

			//Shake button
			var button = $('.btn.btn-lg.btn-block.btn--brand');
			button.shake();
		}


    });

    return View;
});
