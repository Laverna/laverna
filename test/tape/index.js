import {JSDOM} from 'jsdom';
import {mkdirSync} from 'fs';
import glob from 'glob';
import {LocalStorage} from 'node-localstorage';
import overrideTemplate from './overrideTemplate';
import raf from 'raf';

try {
    mkdirSync(`${__dirname}/../../_dev`);
    mkdirSync(`${__dirname}/../../_dev/scratch`);
}
// eslint-disable-next-line
catch (e) {
}

global.localStorage     = new LocalStorage(`${__dirname}/../../_dev/scratch`);
global.overrideTemplate = overrideTemplate;
global.requestAnimationFrame = raf;

/**
 * Create DOM environment.
 */
JSDOM.fromFile(`${__dirname}/../../app/index.html`, {
    url         : 'http://localhost/#',
    contentType : 'text/html',
})
.then(doc => {
    global.document    = doc.window.document;
    global.window      = doc.window;
    global.navigator   = global.window.navigator;
    global.location    = global.window.location;
    global.HTMLElement = doc.window.HTMLElement;

    global.window.localStorage = global.localStorage;
    global.window.setTimeout   = setTimeout;
    global.window.clearTimeout = clearTimeout;

    // Automatically require all test files
    glob.sync(`${__dirname}/**/*.js`)
    .filter(file => file.indexOf('index.js') === -1)
    .forEach(file => require(file));
});
