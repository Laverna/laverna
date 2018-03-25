/**
 * @module utils/fileSaver
 * @license MPL-2.0
 */
import {saveAs} from 'file-saver';

/**
 * Save a file in Cordova environment.
 *
 * @param {String} content
 * @param {String} fileName
 * @param {Function} resolve
 */
function cordovaSave(content, fileName, resolve) {
    const externalDir = window.cordova.file.externalDataDirectory;

    window.resolveLocalFileSystemURL(externalDir, dir => {
        dir.getFile(fileName, {create: true}, file => {
            file.createWriter(writer => {
                writer.write(content);
                resolve();
            });
        });
    });
}

/**
 * Save a file.
 *
 * @param {String} content
 * @param {String} fileName
 * @returns {Promise}
 */
function fileSaver(content, fileName) {
    if (window.cordova) {
        return new Promise(resolve => cordovaSave(content, fileName, resolve));
    }

    // Use HTML5 saveAs
    return Promise.resolve(saveAs(content, fileName));
}

export {fileSaver as default, cordovaSave};
