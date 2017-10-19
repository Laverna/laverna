import _ from 'underscore';

/**
 * Default config values.
 *
 * @namespace
 * @prop {String} appVersion - version of the app
 * @prop {String} firstStart - always equal to 1 until a user goes through
 * first-start tutorial.
 * @prop {Array} modules - an array of enabled modules
 * @license MPL-2.0
 */
const configNames = {
    appVersion         : '0.5.0',
    firstStart         : '1',
    modules            : [],

    /**
     * Main configs.
     *
     * @prop {Array} appProfiles - profile names stored in JSON format
     * @prop {String} appLang - localization (en|fr...etc)
     * @prop {String} theme - theme
     * @prop {String} useDefaultConfigs - (0|1) 1 if the profile should
     * use settings from the main profile.
     * @prop {String} pagination - the number of notes shown per page
     * @prop {String} sortnotes - key by which notes should be sorted
     * @prop {String} sortnotebooks - key by which notebooks should be sorted
     * @prop {String} navbarNotebooksMax - the maximum amount of notebooks shown
     * in the navbar
     */
    general: {
        appProfiles        : ['default'],
        appLang            : '',
        theme              : '',
        useDefaultConfigs  : '1',

        pagination         : '10',
        sortnotes          : 'created',
        sortnotebooks      : 'name',
        navbarNotebooksMax : '5',
    },

    /**
     * Codemirror settings.
     *
     * @prop {String} editMode - (normal|fullscreen|preview)
     * @prop {String} textEditor - keybindings used for the editor (vim|emacs|sublime)
     * @prop {String} indentUnit - number of spaces used for indentation
     */
    codemirror: {
        editMode           : 'preview',
        textEditor         : 'default',
        indentUnit         : '4',
    },

    /**
     * Synchronization settings.
     *
     * @prop {String} signalServer
     * @prop {String} username - username claimed on the signaling server
     * @prop {String} deviceId - unique device ID
     * @prop {Array}  peers    - an array of peers. Every item in the array
     * has the following structure {username, deviceId, lastSeen}
     * @prop {String} cloudStorage - (p2p|dropbox|remotestorage)
     * @prop {String} dropboxKey - dropbox app key
     * @prop {String} dropboxAccessToken - dropbox access token
     */
    sync: {
        signalServer       : 'http://localhost:3000',
        username           : '',
        deviceId           : '',
        peers              : [],
        cloudStorage       : '0',
        dropboxKey         : '',
        dropboxAccessToken : '',
    },

    /**
     * Encryption settings.
     *
     * @prop {String} encrypt - disable/enable encryption (0|1)
     * @prop {String} privateKey - private key
     * @prop {String} publicKey - public key
     * @prop {Object} encryptBackup - used for storing the previous encryption
     * settings.
     */
    encryption: {
        encrypt       : '0',
        privateKey    : '',
        publicKey     : '',
        encryptBackup : {},
    },

    /**
     * Keybinding settings.
     *
     * @prop {String} navigateTop - previous item (default k)
     * @prop {String} navigateBottom - next item (default k)
     * @prop {String} jumpInbox - go to the index page (default g+i)
     * @prop {String} jumpNotebok - go to the notebook page (default g+n)
     * @prop {String} jumpFavorite - go to the favorite page (default g+f)
     * @prop {String} jumpRemoved - go to the trash page (default g+t)
     * @prop {String} jumpOpenTasks - show all notes that have tasks (default g+o)
     * @prop {String} actionsEdit - edit selected note/notebook/tag (default e)
     * @prop {String} actionsOpen - open selected note/notebook/tag (default o)
     * @prop {String} actionsRotateStar - toggle favorite status of a note - s
     * @prop {String} appCreateNote - create a new note/notebook/tag (default c)
     * @prop {String} appSearch - show search box (default /)
     * @prop {String} appKeyboardHelp - show keybinding help (default ?)
     */
    keybindings: {
        navigateTop        : 'k',
        navigateBottom     : 'j',
        jumpInbox          : 'g i',
        jumpNotebook       : 'g n',
        jumpFavorite       : 'g f',
        jumpRemoved        : 'g t',
        jumpOpenTasks      : 'g o',
        actionsEdit        : 'e',
        actionsOpen        : 'o',
        actionsRemove      : 'shift+3',
        actionsRotateStar  : 's',
        appCreateNote      : 'c',
        appSearch          : '/',
        appKeyboardHelp    : '?',
        appShowSidemenu    : 's m',
    },
};

/**
 * Flatten config object.
 *
 * @param {Object} conf = configNames
 * @param {Object} res = {}
 * @returns {Object} - flattened configNames
 */
function flatten(conf = configNames, res = {}) {
    const keys = ['general', 'codemirror', 'sync', 'encryption', 'keybindings'];

    _.each(conf, (val, key) => {
        if (_.indexOf(keys, key) === -1) {
            // eslint-disable-next-line
            return (res[key] = val);
        }

        flatten(val, res);
    });

    return res;
}

export {flatten as flattenConfigs, configNames};
