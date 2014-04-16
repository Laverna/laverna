# Laverna - note taking web app

Laverna is a JavaScript note taking web application with Markdown editor and encryption support.  It's built to be an open source alternative to Evernote.

Application stores all your notes in your browser storages such as indexedDB or localStorage, which is good for security reasons, because only you can get access to them.

**Demo**: https://laverna.cc/ OR http://laverna.github.io/static-laverna/

## Features
-----------

* Markdown editor based on Pagedown
* Manage your notes even if you're offline
* Secure - client side encryption with [SJCL] [1] and AES algotithm.
* Synchronizing with cloud storages. At the time only with Dropbox and RemoteStorage.
* Three editing modes: distraction free, preview and normal mode
* WYSIWYG control buttons
* Syntax highlighting
* No registration required
* Web based
* Keybindings

## Installation
---------------
You can use application at laverna.cc, but we encourage you to install application on your own server or machine. To install do the following:

#### 1. Clone repository:

    git clone git@github.com:Laverna/laverna.git

#### 2. Switch to stable version

    git checkout 0.5.0

#### 2. Install dependencies:

    npm install && bower install

#### 3. Build minified version:

    grunt build

**Build Dependencies**: node.js, bower, grunt.

You can change storages API keys in app/scripts/constants.js

## Support
---------------
1. Hit star button on [github][6]
2. Like us on [alternativeto.net][5]
3. [Contribute][7]

### Tips:
[![Fund us on Gittip](https://raw.github.com/gittip/www.gittip.com/master/www/assets/gittip.png)](https://www.gittip.com/Laverna/ "Fund us on Gittip")
[Bitcoin][3]

## Licence
--------------
Published under GNU GPL v.3

Also Laverna uses a lot of other libraries and each of this [libraries uses different licences] [2].

[1]: http://bitwiseshiftleft.github.io/sjcl/
[2]: https://github.com/Laverna/laverna/blob/master/bower.json
[3]: http://blockchain.info/address/18JpeKeSaoryHCkfV63XcvLZUgeuuATp86
[4]: https://www.gittip.com/Laverna/
[5]: http://alternativeto.net/software/laverna/
[6]: https://github.com/Laverna/laverna
[7]: https://github.com/Laverna/laverna/blob/master/CONTRIBUTE.md
