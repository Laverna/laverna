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

    ipcRenderer.on('lav:settings', () => {
        urlChannel.request('navigate', {url: '/settings'});
    });

    ipcRenderer.on('lav:newNote', () => {
        urlChannel.request('navigate', {url: '/notes/add'});
    });

    ipcRenderer.on('lav:about', () => {
        Radio.request('components/help', 'showAbout');
    });

    ipcRenderer.on('lav:import:evernote', (e, data) => {
        Radio.request('components/importExport', 'importEvernote', data);
    });

    ipcRenderer.on('lav:backup:key', () => {
        Radio.request('components/importExport', 'export', {exportKey: true});
    });

    ipcRenderer.on('lav:backup:data', () => {
        Radio.request('components/importExport', 'export');
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
