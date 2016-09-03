/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'marionette',
    'backbone.radio',
    'modalRegion',
    'brandRegion'
], function(Marionette, Radio, ModalRegion, BrandRegion) {
    'use strict';

    /**
     * Main region manager
     */
    var rm    = new Marionette.RegionManager(),
        $body = $('body');

    rm.addRegions({
        sidebarNavbar : '#sidebar--navbar',
        sidebar       : '#sidebar--content',
        content       : '#content',
        brand         : BrandRegion,
        modal         : ModalRegion
    });

    Radio.channel('global')
    .reply('region:show', function(region, view) {
        // There should be only one modal window at a time
        if (region === 'modal' && rm.get(region).currentView) {
            rm.get(region).currentView.trigger('hidden.modal');
        }

        rm.get(region).show(view);
        Radio.trigger('region', region + ':shown');
    })
    .reply('region:add', function(name, block) {

        // The region already exists
        if (rm.get(name)) {
            return;
        }

        $body.append(block || '<div id="' + name + '"></div>');
        rm.addRegion(name, '#' + name);
    })
    .reply('region:empty', function(region) {
        Radio.trigger('region', region + ':hidden');
        rm.get(region).empty();
    })
    .reply('region:visible', function(region, hideClass) {
        region = rm.get(region);
        region.$el.removeClass(hideClass || 'hidden');
    })
    .reply('region:hide', function(region, hideClass) {
        region = rm.get(region);
        region.$el.addClass(hideClass || 'hidden');
    });

    return rm;
});

