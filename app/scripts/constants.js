/*global define*/
define(['underscore'], function (_) {
    'use strict';

    var constants = {};

    constants.VERSION = '0.6.2';
    constants.URL = location.origin + location.pathname.replace('index.html', '');

    // List of hosts and urls where default dropbox API will work
    constants.DEFAULTHOSTS = ['laverna.cc', 'laverna.github.io', 'localhost'];

    constants.DROPBOX_KEY = '10iirspliqts95d';
    constants.DROPBOX_SECRET = null;

    // Default Dropbox API key will not work
    if ( !_.contains(constants.DEFAULTHOSTS, location.host) ) {
        constants.DROPBOXKEYNEED = true;
    }

    return constants;
});
