/**
 * @file instantiate all collection modules
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';

import Configs from './Configs';
import Files from './Files';
import Notebooks from './Notebooks';
import Notes from './Notes';
import Tags from './Tags';

/**
 * Instantiate all collection modules
 *
 * @todo use profileId when fetching configs (get from the url)
 * @returns {Promise}
 */
function initializer() {
    // Instantiate all collection modules to start listening to requests
    new Configs();
    new Files();
    new Notebooks();
    new Notes();
    new Tags();

    // Find or create configs
    return Radio.request('collections/Configs', 'find', {profileId: 'notes-db'});
}

// Add a new initializer
Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:components',
        callback: initializer,
    });
});
