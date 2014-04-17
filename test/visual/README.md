is wip.

`npm install` should install all dependencies: phantomjs, casperjs and phantomcss. (if you haven't had laverna running before, also do `bower install`.)

then run

        $ ./node_modules/casperjs/bin/casperjs test test/visual/testsuite.js

to make reference screenshots. run again to see tests passing against them.

run `grunt serve`, add some css for `#header-title` at the end of `styles/theme-default/theme-default.less`, then run again to see tests fail.

also, the failure screenshots show up as untracked files in `git status`.


next steps:

- https://github.com/chrisgladd/grunt-phantomcss
- set up grunt task to clean up after green tests