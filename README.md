# Laverna

Laverna is a web application written on JavaScript. It's built to be an open source alternative to Evernote.

Laverna stores notes in indexedDB and personal settings in local storage.

Try it here: https://laverna.cc/

## Features
-----------

* Markdown editor based on Pagedown
* Manage your notes even if you're offline
* Secure - client side encryption with [SJCL] [1] and AES algotithm.
* Synchronizing with cloud storages. At the time only with Dropbox.
* Three editing modes: distraction free, preview and normal mode
* WYSIWYG control buttons
* Syntax highlighting
* No registration required
* Web based
* Keybindings

## Installation
If you want to install Laverna on your machine, just do the following:

1. Install dependencies: node.js, bower, grunt.
2. Run **npm install**, then **bower install** and **grunt**

You can change storages API keys in app/scripts/constants.js

## Donate
---------------
If you're like this open source project please support it by donating to:

[![Fund us on Gittip](https://raw.github.com/gittip/www.gittip.com/master/www/assets/gittip.png)](https://www.gittip.com/Laverna/ "Fund us on Gittip")
[Bitcoin: 18JpeKeSaoryHCkfV63XcvLZUgeuuATp86] [3]

## Licence
Published under GNU GPL v.3

Also Laverna uses a lot of other libraries and each of this [libraries uses different licences] [2].

[1]: http://bitwiseshiftleft.github.io/sjcl/
[2]: https://github.com/Laverna/laverna/blob/master/bower.json
[3]: bitcoin:18JpeKeSaoryHCkfV63XcvLZUgeuuATp86
[4]: https://www.gittip.com/Laverna/
