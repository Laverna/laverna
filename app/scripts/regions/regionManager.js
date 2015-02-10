/* global define */
define([
    'marionette',
    'helpers/communicator',
    'modalRegion',
    'brandRegion'
], function(Marionette, channel, ModalRegion, BrandRegion) {
    'use strict';

    /**
     * Main region manager
     */
    var rm = new Marionette.RegionManager(),
        regions;

    rm.addRegions({
        sidebarNavbar : '#sidebar-navbar',
        sidebar       : '#sidebar-content',
        content       : '#content',
        brand         : BrandRegion,
        modal         : ModalRegion
    });

    regions = rm.getRegions();

    channel.comply('region:show', function(region, view) {
        return regions[region].show(view);
    });

    return regions;
});
