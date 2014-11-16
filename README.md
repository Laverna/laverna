# Laverna - note taking web app

Laverna is a JavaScript note-taking web application with a Markdown editor and encryption support.  It's built to be an open source alternative to Evernote.

The application stores all your notes in your browser local storage spaces such as indexedDB or localStorage, which is good for security reasons, because only you have access to them.

**Demo**: https://laverna.cc/ OR http://laverna.github.io/static-laverna

## Features
-----------

* Markdown editor based on Pagedown
* Manage your notes, even when you're offline
* Secure client-side encryption
* Synchronizes with cloud storage services (at this time only Dropbox and RemoteStorage are supported)
* Three editing modes: distraction free, preview, and normal mode
* WYSIWYG control buttons
* MathJax support
* Syntax highlighting
* No registration required
* Web based
* Keybindings

## Installation
---------------
You can use the application at laverna.cc, but we encourage you to install it on your own server or machine.

You can download the minified version of Laverna app from [Laverna/static-laverna][9] repository if you don't want to build it yourself:

```bash
$ git clone -b gh-pages https://github.com/Laverna/static-laverna
```

## Installation from source
---------------
To install, do the following:

#### 1. Clone repository:

```bash
$ git clone git@github.com:Laverna/laverna.git
```

#### 2. Switch to stable version:
Please, make sure that you switched to 0.6.2 release. Master branch is not stable yet.

```bash
$ git checkout 0.6.2
```

#### 3. Ensure you have the node.js platform installed. See OS-specific instructions on their [website][8].

#### 4. Ensure you have the bower and grunt packages installed:

```bash
$ npm install bower
$ npm install grunt
$ npm install grunt-cli
```

#### 5. Install Laverna's dependencies:

```bash
$ npm install && bower install
```

#### 6. Build minified version of Laverna:

```bash
$ grunt build
```

You can change the storage API keys in app/scripts/constants.js

## Support
---------------
1. Hit star button on [github][6]
2. Like us on [alternativeto.net][5]
3. [Contribute][7]

### Tips:
[![Fund us on Gittip](https://raw.github.com/gittip/www.gittip.com/860a9f84d7987cea59bad16114aa71543934eca5/www/assets/gittip.png)](https://www.gittip.com/Laverna/ "Fund us on Gittip")

[Bitcoin][3]

## Security
--------------
Laverna uses the [SJCL] [1] library implementing the AES algorithm. You can review the code at:
* https://github.com/Laverna/laverna/blob/master/app/scripts/apps/encryption/auth.js
* https://github.com/Laverna/laverna/blob/master/app/scripts/apps/encryption/encrypt/modelEncrypt.js

## License
--------------
Published under GNU GPL v.3

Laverna uses a lot of other libraries and each of these [libraries uses different licenses] [2].

[1]: http://bitwiseshiftleft.github.io/sjcl/
[2]: https://github.com/Laverna/laverna/blob/master/bower.json
[3]: http://blockchain.info/address/18JpeKeSaoryHCkfV63XcvLZUgeuuATp86
[4]: https://www.gittip.com/Laverna/
[5]: http://alternativeto.net/software/laverna/
[6]: https://github.com/Laverna/laverna
[7]: https://github.com/Laverna/laverna/blob/master/CONTRIBUTE.md
[8]: http://nodejs.org
[9]: https://github.com/Laverna/static-laverna/archive/gh-pages.zip
