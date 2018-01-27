/**
 * @file instantiate all collection modules
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';

import Profiles from './Profiles';
import Configs from './Configs';
import Users from './Users';
import Files from './Files';
import Notebooks from './Notebooks';
import Notes from './Notes';
import Tags from './Tags';
import Shadows from './Shadows';
import Edits from './Edits';

/**
 * Instantiate all collection modules
 *
 * @returns {Promise}
 */
function initializer() {
    // Instantiate all collection modules to start listening to requests
    new Profiles();
    new Configs();
    new Users();
    new Files();
    new Notebooks();
    new Notes();
    new Tags();
    new Shadows();
    new Edits();

    // Find or create configs
    return Radio.request('collections/Profiles', 'find');
}

// Add a new initializer
Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:core',
        callback: initializer,
    });
});

export default initializer;
