/*global define*/
define([ ], function () {
    'use strict';

    var constants = {};
    constants.VERSION = '0.0.0';

    constants.URL = 'http://laverna.cc/';
    constants.DROPBOX_KEY = 'io5vfg4w33jx9o4';
    constants.DROPBOX_SECRET = 'u4rt9wf6id9xbi5';

    // On localhost
    if (location.hostname.indexOf('localhost') === 0) {
        constants.URL = location.origin + location.pathname;
    }

    return constants;
});
