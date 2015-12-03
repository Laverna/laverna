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
    'marionette',
    'backbone.radio',
    'text!modules/linkDialog/templates/item.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template : _.template(Tmpl),
        tagName  : 'li'
    });

    return View;
});
