/*global define*/
define([ ], function () {
    'use strict';

    var constants = {};
    constants.VERSION = '0.5.0';

    constants.URL = location.origin + location.pathname.replace('index.html', '');
    constants.DROPBOX_KEY = '10iirspliqts95d';
    // constants.DROPBOX_SECRET = null;

    return constants;
});
