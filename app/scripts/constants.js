/*global define*/
define([ ], function () {
    'use strict';

    var constants = {};
    constants.VERSION = '0.1.0';

    constants.URL = 'http://laverna.cc/';
    constants.DROPBOX_KEY = '10iirspliqts95d';
    constants.DROPBOX_SECRET = 'o9h9a2mcn0mte01';

    // On localhost
    if (location.hostname.indexOf('localhost') === 0) {
        constants.URL = location.origin + location.pathname;
    }

    return constants;
});
