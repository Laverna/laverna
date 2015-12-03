/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
(function(root, factory) {
    'use strict';
    /* global define */
    if (typeof define === 'function' && define.amd) {
        define(['marionette', 'backbone.radio', 'underscore'], function(Marionette, Radio, _) {
            return factory(Marionette, Radio, _);
        });
    }
    else if (typeof exports !== 'undefined') {
        var Marionette = require('marionette');
        var Radio = require('backbone.radio');
        var _ = require('underscore');
        module.exports = factory(Marionette, Radio, _);
    }
    else {
        factory(root.Backbone.Marionette, root.Backbone.Radio, root._);
    }
}(this, function(Marionette, Radio, _) {
    'use strict';

    Marionette.Application.prototype._initChannel = function() {
        this.channelName = _.result(this, 'channelName') || 'global';
        this.channel = _.result(this, 'channel') || Radio.channel(this.channelName);
        this.reqres = this.channel;
    };
}));
