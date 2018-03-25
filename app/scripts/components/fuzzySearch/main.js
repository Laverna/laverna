/**
 * @module components/fuzzySearch/main
 * @license MPL-2.0
 */
import $ from 'jquery';
import Radio from 'backbone.radio';
import Controller from './Controller';
import regionClass from './views/Region';

const main = {

    initialize() {
        main.createRegion();

        // Instantiate fuzzy search controller on shown:search event
        Radio.channel('components/navbar')
        .on('shown:search', () => new Controller().init());
    },

    /**
     * Create fuzzySearch region.
     *
     * @returns {Object} region instance
     */
    createRegion() {
        $('#sidebar').append(
            '<div id="sidebar--fuzzy" class="layout--body -scroll hidden"/>'
        );

        Radio.request('Layout', 'add', {
            region        : 'fuzzySearch',
            regionOptions : {regionClass, el: '#sidebar--fuzzy'},
        });
    },

};

Radio.once('App', 'start', main.initialize);

export default main;
