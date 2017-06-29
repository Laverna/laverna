/**
 * @module utils/electronListener
 * @license MPL-2.0
 */
import Radio from 'backbone.radio';

/**
 * Listen to events sent by the main Electron process.
 */
function electronListener() {
    // Do nothing if it isn't Electron environment
    if (!window.electron) {
        return false;
    }

    const urlChannel     = Radio.channel('utils/Url');
    const {ipcRenderer}  = window.electron;
    const includeProfile = true;

    ipcRenderer.on('lav:settings', () => {
        urlChannel.request('navigate', {includeProfile, url: '/settings'});
    });

    ipcRenderer.on('lav:newNote', () => {
        urlChannel.request('navigate', {includeProfile, url: '/notes/add'});
    });

    ipcRenderer.on('lav:about', () => {
        Radio.request('components/help', 'showAbout');
    });

    return true;
}

Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:utils',
        callback: electronListener,
    });
});

export default electronListener;
