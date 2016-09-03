/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette'
], function(_, Marionette) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template : _.template('{=cleanXSS(name)}'),
        tagName  : 'option',

        onRender : function() {
            this.$el.attr('value', this.model.get('id'));
        }
    });

    return View;
});
