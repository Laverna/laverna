/*global define*/
define([
    'jquery',
    'app'
], function ($, App) {
    'use strict';

    var Search = App.module('Search', {startWithParent : false}),
        searchForm,
        searchInput,
        text;

    Search.start = function () {
        searchInput = $('#search-input');
        searchForm = $('.search-form');

        // Blur when user hits ESC
        searchInput.keyup(function (e) {
            if (e.which === 27) {
                searchInput.blur();
            }
        });

        // Search
        searchForm.submit(function (e) {
            e.preventDefault();
            text = searchInput.val();
            App.navigate('/notes/f/search/q/' + text, true);
        });
    };

    return Search;

});
