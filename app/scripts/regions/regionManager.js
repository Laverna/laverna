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
    var rm = new Marionette.RegionManager();

    rm.addRegions({
        sidebarNavbar : '#sidebar-navbar',
        sidebar       : '#sidebar-content',
        content       : '#content',
        brand         : BrandRegion,
        modal         : ModalRegion
    });

    Radio.channel('global')
    .comply('region:show', function(region, view) {
        return rm.get(region).show(view);
    })
    .comply('region:empty', function(region) {
        return rm.get(region).empty();
    });

    return rm;
});

