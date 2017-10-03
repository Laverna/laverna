/**
 * Configs that don't change.
 *
 * @module constants
 * @license MPL-2.0
 */
import _ from 'underscore';

/**
 * @namespace constants
 * @prop {String} version - current version of the app
 * @prop {String} url - the URL where the app is accessed from
 * @prop {Array} defaultHosts - hosts that Dropbox auth server accepts
 * @prop {String} dropboxKey - dropbox API key
 * @prop {String} dropboxSecret - dropbox secret key (not necessary)
 * @prop {Boolean} dropboxKeyNeed - true if the default Dropbox API key will
 * not work and a user needs to provid their own
 */
const constants = {
    version       : '0.7.51',
    url           : location.origin + location.pathname.replace('index.html', ''),
    defaultHosts  : [
        'laverna.cc',
        'laverna.github.io',
        'localhost',
        'localhost:9000',
        'localhost:9100',
    ],
    dropboxKey    : '10iirspliqts95d',
    dropboxSecret : null,
    dropboxKeyNeed: false,
};

// The default Dropbox API key will not work
if (!_.contains(constants.defaultHosts, location.host)) {
    constants.dropboxKeyNeed = true;
}

export default constants;
