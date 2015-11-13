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
    .reply('region:show', function(region, view) {
        // There should be only one modal window at a time
        if (region === 'modal' && rm.get(region).currentView) {
            rm.get(region).currentView.trigger('hidden.modal');
        }

        rm.get(region).show(view);
        Radio.trigger('region', region + ':shown');
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

