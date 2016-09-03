'use strict';

const electron        = require('electron'),
    windowStateKeeper = require('electron-window-state'),
    path              = require('path'),
    openUrl           = require('open');

const {app, BrowserWindow, Menu, Tray, protocol} = electron;

let argv = require('minimist')(process.argv.slice(1)),
    win  = null,
    appHelper;

// Show command line help
if (argv.help || argv.h) {
    console.log('Usage: laverna [options]\r\n');
    console.log('--help', 'Show this help');
    console.log('--dev ', 'Show developer tools automatically on start');
    console.log('--tray', 'Hide to tray on start');
    console.log(
        '--data-dir',
        'Directory where data is stored.',
        'Example: laverna --data-dir=../data'
    );

    return app.quit();
}

// Allow to change the directory where the data is stored
if (argv['data-dir'] && argv['data-dir'].trim()) {
    let dataDir = argv['data-dir'].trim();

    // The same or parent directory
    if (dataDir.search(/^\./) > - 1) {

        // Always store data in a separate directory
        dataDir += (dataDir.search(/^\.{1,2}$/) > -1 ? '/laverna-data' : '');

        dataDir = path.join(__dirname, dataDir);
    }

    app.setPath('userData', path.normalize(dataDir));
}

appHelper = {

    // The page which will be loaded in the window
    page: 'http://localhost:9000/',

    // Icon of the app
    icon: path.join(__dirname, '/dist/images/icon/',
      process.platform === 'darwin' ? 'IconMenubarTemplate.png' : 'icon-120x120.png'
    ),

    // The main menu
    menu: [
        {
            label   : '&File',
            submenu : [
                {
                    label       : 'Quit',
                    accelerator : 'CmdOrCtrl+Q',
                    click       : function() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '&Edit',
            submenu: [
                {
                    label       : 'Undo',
                    accelerator : 'CmdOrCtrl+Z',
                    role        : 'undo'
                },
                {
                    label       : 'Redo',
                    accelerator : 'Shift+CmdOrCtrl+Z',
                    role        : 'redo'
                },
                {type: 'separator'},
                {
                    label       : 'Cut',
                    accelerator : 'CmdOrCtrl+X',
                    role        : 'cut'
                },
                {
                    label       : 'Copy',
                    accelerator : 'CmdOrCtrl+C',
                    role        : 'copy'
                },
                {
                    label       : 'Paste',
                    accelerator : 'CmdOrCtrl+V',
                    role        : 'paste'
                },
                {type: 'separator'},
                {
                    label       : 'Select All',
                    accelerator : 'CmdOrCtrl+A',
                    role        : 'selectall'
                },
            ]
        },
        {
            label: '&View',
            submenu: [
                {
                    label       : 'Reload',
                    accelerator : 'CmdOrCtrl+R',
                    click       : function(item, focusedWindow) {
                        if (focusedWindow) { focusedWindow.reload(); }
                    }
                },
                {
                    label       : 'Toggle Developer Tools',
                    accelerator : process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click       : function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.toggleDevTools();
                        }
                    }
                }
            ]
        },
    ],

    // Tray menu (shown on right click)
    menuTray: [
        {
            label: 'Quit',
            click: function() {
                app.quit();
            }
        }
    ],

    /**
     * Electron is ready.
     */
    onReady: function() {
        this
        .interceptProtocol()
        .createWindow()
        .createMenu()
        .createTray()
        .registerEvents();
    },

    /**
     * Override HTTP protocol. The reason:
     * In order to make oAuth authentifications to Dropbox/RemoteStorage,
     * we need to serve the app from https? protocol and have relative paths.
     */
    interceptProtocol: function() {
        protocol.interceptHttpProtocol('http', function(req, callback) {

            if (req.url.search(appHelper.page) > - 1) {

                // Remove the domain, path, and hash location
                req.url = req.url.replace(appHelper.page, '');
                req.url = req.url.split('#')[0] || 'index.html';

                // Serve the resource from the file system
                req.url = 'file:///' + path.normalize(__dirname + '/dist/' + req.url);
            }

            callback(req);

        });

        return this;
    },

    /**
     * Create the main window.
     */
    createWindow: function() {

        // Recover window state (width, height, and x&y position)
        this.state = windowStateKeeper('main', {
            width  : 1000,
            height : 600
        });

        // Create new browser window
        win = new BrowserWindow({
            width  : this.state.width,
            height : this.state.height,
            x      : this.state.x,
            y      : this.state.y,

            title           : 'Laverna',
            icon            : this.icon,
            autoHideMenuBar : true,
            backgroundColor : '#00a693',

            webPreferences      : {
                nodeIntegration : true,
                preload         : path.resolve(path.join(__dirname, 'preload.js')),
            },
        });

        if (this.state.isMaximized) {
            win.maximize();
        }

        // Load the app
        win.loadURL(this.page);

        // Show development tools
        if (process.env.NODE_ENV === 'dev' || argv.dev) {
            win.webContents.openDevTools();
        }

        return this;
    },

    /**
     * Create the main menu.
     */
    createMenu: function() {

        // Slightly different menu on OS X
        if (process.platform === 'darwin') {
            this.menu[0] = {
                label   : 'Laverna',
                submenu : this.menu[0].submenu
            };
        }

        let menu = Menu.buildFromTemplate(this.menu);
        Menu.setApplicationMenu(menu);

        return this;
    },

    /**
     * Create tray icon.
     */
    createTray: function() {
        let icon = new Tray(this.icon),
            menu = Menu.buildFromTemplate(this.menuTray);

        icon.setToolTip('Laverna');
        icon.setContextMenu(menu);

        // Auto hide to tray on start
        if (argv.tray) {
            win.hide();
        }

        // Hide the window into tray on click
        icon.on('click', function() {
            if (win.isVisible()) {
                return win.hide();
            }
            win.show();
        });

        return this;
    },

    /**
     * Listen to window events.
     */
    registerEvents: function() {

        // Save window state (width, height, and x&y position)
        win.on('close', function() {
            this.state.saveState(win);
        }.bind(appHelper));

        win.on('closed', function() {
            win = null;
        });

        win.webContents.on('will-navigate', appHelper.onNavigate.bind(appHelper));
        win.webContents.on('new-window', appHelper.onNavigate.bind(appHelper));

        // Disable nodeIntegration
        // win.webContents.on('new-window', appHelper.onNewWindow.bind(appHelper));
    },

    /**
     * Open URLs in an external browser.
     */
    onNavigate: function(e, url) {
        if (url.search(this.page) === -1 &&
            url.search(/(oauth|sign_in)/) === -1 &&
            url.search(/^blob:/) === -1) {

            e.preventDefault();
            return openUrl(url);
        }
    },

    /**
     * Disable nodeIntegration on all pages except for app's.
     */
    onNewWindow: function(e, url) {
        if (url.search(this.page) === -1 &&
            url.search(/^blob:/) === -1) {

            e.preventDefault();

            let extWin = new BrowserWindow({
                width  : 600,
                height : 600,
                autoHideMenuBar     : true,
                webPreferences      : {
                    nodeIntegration : false,
                },
            });

            // Load the app
            extWin.loadURL(url);
            extWin.on('closed', function() { extWin = null; });
        }
    },

};

// Create browser window when Electron is ready
app.on('ready', appHelper.onReady.bind(appHelper));

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

app.on('activate', function() {
    /*
     * On OS X it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     */
    if (win === null) {
        appHelper.onReady();
    }
});
