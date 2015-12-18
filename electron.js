'use strict';

var app               = require('app'),
    windowStateKeeper = require('electron-window-state'),
    BrowserWindow     = require('browser-window'),
    menu              = require('menu');

// Start server
require('./server');

var menuTemplate = [{
    label: 'Application',
    submenu: [{
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function() {
            app.quit();
        }
    }]
}, {
    label: 'Edit',
    submenu: [{
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
    }, {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
    }, {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
    }]
}];

// Report crashes to our server.
// require('crash-reporter').start();

/*
 * Keep a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 */
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    /*
     * On OS X it is common for applications and their menu bar
     * to stay active until the user quits explicitly with Cmd + Q
     */
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/*
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 */
app.on('ready', function() {

    menu.setApplicationMenu(menu.buildFromTemplate(menuTemplate));

    let windowState = windowStateKeeper('main', {
        width  : 1000,
        height : 600
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width                : windowState.width,
        height               : windowState.height,
        x                    : windowState.x,
        y                    : windowState.y,
        'node-integration'   : true,
        'auto-hide-menu-bar' : true,
        'icon'               : './resources/app/images/icon/icon-120x120.png'
    });

    // Open all external links in a different browser
    mainWindow.webContents.on('will-navigate', function(e, url) {
        if (url.indexOf('localhost:9100') === -1 &&
           url.indexOf('oauth') === -1 &&
           url.indexOf('sign_in') === -1) {

            e.preventDefault();
            require('open')(url);
        }
    });

    mainWindow.webContents.on('new-window', function(e, url) {
        if (url.indexOf('localhost:9100') === -1 &&
            url.indexOf('oauth') === -1 &&
            url.indexOf('sign_in') === -1) {

            e.preventDefault();
            require('open')(url);
        }
    });

    if (windowState.isMaximized) {
        mainWindow.maximize();
    }

    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:9100/');

    // Open the DevTools.
    // mainWindow.openDevTools();

    mainWindow.on('close', function() {
        windowState.saveState(mainWindow);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        /*
         * Dereference the window object, usually you would store windows
         * in an array if your app supports multi windows, this is the time
         * when you should delete the corresponding element.
         */
        mainWindow = null;
    });
});
