<div align="center">
  <h1>Laverna | The open source note-taking app</h1>

  <h3>🔖  &nbsp;🔏  &nbsp;📄&nbsp;</h3>
  <p><strong>A clean, lightweight alternative to Evernote that keeps your notes encrypted.</strong><br>
    Demo: https://laverna.cc <i> &nbsp;– or –&nbsp; </i> http://laverna.github.io/static-laverna</p>

  [![Build Status](https://travis-ci.org/Laverna/laverna.svg?branch=dev)](https://travis-ci.org/Laverna/laverna)
  [![Coverage Status](https://coveralls.io/repos/github/Laverna/laverna/badge.svg?branch=dev)](https://coveralls.io/github/Laverna/laverna)
  [![Code Climate](https://codeclimate.com/github/Laverna/laverna/badges/gpa.svg)](https://codeclimate.com/github/Laverna/laverna)
  
  <h3>    
    <a href="https://gitter.im/Laverna/laverna">
      Gitter
    </a>
    <span> | </span>
    <a href="https://webchat.freenode.net/?channels=laverna">
      IRC
    </a>
    <span> | </span>
    <a href="https://github.com/Laverna/laverna/wiki">
      Wiki
    </a>
    <span> | </span>
    <a href="#developer-install--documentation">
      Contribute
    </a>
  </h3>

  <sub>
    Laverna uses the
    <a href="http://marionettejs.com/">Marionette JS framework</a>,
    <a href="http://gulpjs.com/">Gulp</a> and runs on Node.js. The test runner is <a href="https://github.com/substack/tape">tape</a>
  </sub>
</div>

## Features

* Markdown editor based on Pagedown
* Synchronization with cloud storage via Dropbox or RemoteStorage
* Multiple editing modes: normal, preview, and distraction free
* Offline access to your notes
* WYSIWYG control buttons
* Syntax highlighting, MathJax support
* Robust keyboard shortcuts


## Security
* Client-side AES document encryption.
* No registration required. Laverna manages signup and login via security tools built-in to all modern web browsers.
* By default, Laverna stores notes using the database in your browser (such as indexedDB or localStorage). This means that no data is synced to the cloud without your permission.

<hr>

## Quick Start (recommended)

Open [laverna.cc](https://laverna.cc/) and get started in less than 30 seconds. No extra steps are required!

## Install Desktop App (beta)

After downloading, unpack the `.zip` files. Inside the unpacked folder (e.g. `cd ~/Applications/laverna-0.7.51`), run an executable: `laverna.exe` for Windows, `laverna` for Linux and Mac.

### Windows

* Download 64-bit: https://github.com/Laverna/laverna/releases/download/0.7.51/laverna-0.7.51-win32-x64.zip
* Download 32-bit: https://github.com/Laverna/laverna/releases/download/0.7.51/laverna-0.7.51-win32-ia32.zip

### macOS

* Download: https://github.com/Laverna/laverna/releases/download/0.7.51/laverna-0.7.51-darwin-x64.zip

### Linux

* Download 64-bit: https://github.com/Laverna/laverna/releases/download/0.7.51/laverna-0.7.51-linux-x64.zip
* Download 32-bit: https://github.com/Laverna/laverna/releases/download/0.7.51/laverna-0.7.51-linux-ia32.zip

#### Arch Linux (or derived distributions)

* Install the package [hosted here](https://aur.archlinux.org/packages/laverna/). Once installed, run: `$ pacaur -S laverna`

### Previous Releases

* All historical releases[ are available here](https://github.com/Laverna/laverna/releases).

> *Running into issues with installation? Report [here](https://github.com/funilrys/PKGBUILD/issues/new) or contact [@funilrys](https://github.com/funilrys) on Gitter [here](https://gitter.im/funilrys_/PKGBUILD)*.

## Install a Prebuilt Version

**Download via wget:**

```bash
$ wget https://github.com/Laverna/static-laverna/archive/gh-pages.zip -O laverna.zip
```

**Unpack the downloaded archive:**

```bash
$ unzip laverna.zip
```

**Open **`index.html`** (from inside the Laverna folder) in any browser.**

<hr>

## Developer Install & Documentation

To run Laverna locally, you'll need to have the following installed:

* [Node.js](https://nodejs.org/) version 6.11.4. Laverna works with other versions, but requires additional configuration and is not recommended.
* [MongoDB](https://docs.mongodb.com/manual/installation/)
* [Git](https://git-scm.com/book/en/v2) (note: Windows users need to set the PATH variable for git after installation).

### Step 1

If you're planning to contribute to the project's development, hit the fork button at the top of the page and move on to **Step 2**.


**Clone the Laverna repository:**

```bash
$ git clone git@github.com:Laverna/laverna.git
```

### Step 2

**Navigate to project directory and checkout `dev` branch:**

```bash
$ cd laverna

# unless you're patching bugs in the latest release, switch to dev branch:
$ git fetch && git checkout dev
```

**Install Gulp:**

```bash
$ npm install gulp
$ npm install -g gulp
```

**Install dependencies and build:**

```bash
$ npm run setup
```

**Start Laverna:**

```bash
$ gulp
```

> *Make sure you have Gulp installed locally AND globally!*

### Step 3

**Clone the repository for [Laverna's backend Signal Server](https://github.com/Laverna/laverna-server):**

```bash
$ git clone git@github.com:Laverna/server.git
```

**Install dependencies:**

```bash
$ cd server && npm install
```

**Configure the Signal Server:**

Copy `.env.example` to `.env` and change configs in the new file.

**Start the Signal Server:**

```bash
$ npm start
```


## Coding Style Guidelines

We ask that you use either **plain JavaScript or the [Marionette.js](http://marionette.js/) framework** (for more details on the preferred coding style see [.editorconfig](https://github.com/Laverna/laverna/blob/master/.editorconfig)). All experimental changes are pushed to the `dev` branch. Feature changes need to be done on either `dev` or a branch that uses `dev` as its parent.

Localizations [are available here.](https://github.com/Laverna/laverna/blob/dev/CONTRIBUTE.md)

## Encryption

Laverna uses the [SJCL](http://bitwiseshiftleft.github.io/sjcl/) library for implementing the AES algorithm. You can review the code here:

* https://github.com/Laverna/laverna/blob/master/app/scripts/classes/encryption.js
* https://github.com/Laverna/laverna/blob/master/app/scripts/apps/encryption/


## Donations

* [BountySource](https://www.bountysource.com/teams/laverna)
* [Bitcoin](http://blockchain.info/address/1Q68HfLjNvWbLFr3KGK6nfXg7vc3hpDr11)


## Support Laverna

* Hit the star button on [GitHub](https://github.com/Laverna/laverna)
* Like us on [alternativeto.net](http://alternativeto.net/software/laverna/)
* Contribute!


## License

Published under [MPL-2.0 License](https://www.mozilla.org/en-US/MPL/2.0/).
Laverna uses a lot of other libraries and each of these [libraries use different licenses](https://github.com/Laverna/laverna/blob/master/bower.json).

[1]: http://bitwiseshiftleft.github.io/sjcl/
[2]: https://github.com/Laverna/laverna/blob/master/bower.json
[3]: http://blockchain.info/address/1Q68HfLjNvWbLFr3KGK6nfXg7vc3hpDr11
[4]: https://www.gittip.com/Laverna/
[5]: http://alternativeto.net/software/laverna/
[6]: https://github.com/Laverna/laverna
[7]: https://github.com/Laverna/laverna/blob/master/CONTRIBUTE.md
[8]: http://nodejs.org
[9]: https://github.com/Laverna/static-laverna/archive/gh-pages.zip
[10]: https://laverna.cc/index.html
[11]: https://www.mozilla.org/en-US/MPL/2.0/
[12]: https://www.bountysource.com/teams/laverna
[13]: https://github.com/Laverna/laverna/releases
[14]: https://git-scm.com/book/en/v2
[15]: https://github.com/Laverna/laverna/wiki
