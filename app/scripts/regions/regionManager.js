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
        sidebarNavbar : '#sidebar--navbar',
        sidebar       : '#sidebar--content',
        content       : '#content',
        brand         : BrandRegion,
        modal         : ModalRegion
    });

    Radio.channel('global')
    .comply('region:show', function(region, view) {
        rm.get(region).show(view);
        Radio.trigger('region', region + ':shown');
    })
    .comply('region:empty', function(region) {
        Radio.trigger('region', region + ':hidden');
        rm.get(region).empty();
    })
    .comply('region:visible', function(region, hideClass) {
        region = rm.get(region);
        region.$el.removeClass(hideClass || 'hidden');
    })
    .comply('region:hide', function(region, hideClass) {
        region = rm.get(region);
        region.$el.addClass(hideClass || 'hidden');
    });

    return rm;
});

