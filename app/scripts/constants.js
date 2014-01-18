/*global define*/
define([ ], function () {
    'use strict';

    var constants = {};
    constants.VERSION = '0.1.2';

    constants.URL = 'http://laverna.cc/';
    constants.DROPBOX_KEY = '10iirspliqts95d';
    constants.DROPBOX_SECRET = null;

    // On localhost
    if (location.hostname.indexOf('localhost') === 0) {
        constants.URL = location.origin + location.pathname.replace('index.html', '');
    }

    return constants;
});
