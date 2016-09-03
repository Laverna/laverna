'use strict';

/**
 * Concatenate all Prism.js dependencies/languages into one file.
 */
module.exports = function(gulp, plugins) {
    return function() {
        /* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+abap+actionscript+apacheconf+apl+applescript+aspnet+autoit+autohotkey+bash+basic+batch+c+brainfuck+bison+csharp+cpp+coffeescript+ruby+css-extras+d+dart+diff+docker+eiffel+elixir+erlang+fsharp+fortran+gherkin+git+glsl+go+groovy+handlebars+haskell+haxe+http+icon+inform7+ini+j+jade+java+julia+keyman+kotlin+latex+less+lolcode+lua+makefile+markdown+matlab+mel+mizar+monkey+nasm+nginx+nim+nix+nsis+objectivec+ocaml+oz+parigp+parser+pascal+perl+php+php-extras+powershell+processing+prolog+puppet+pure+python+q+qore+r+jsx+rest+rip+roboconf+crystal+rust+sas+sass+scss+scala+scheme+smalltalk+smarty+sql+stylus+swift+tcl+textile+twig+typescript+verilog+vhdl+vim+wiki+yaml */
        var components = 'markup+css+clike+javascript+abap+actionscript+apacheconf+apl+applescript+aspnet+autoit+autohotkey+bash+basic+batch+c+brainfuck+bison+csharp+cpp+coffeescript+ruby+css-extras+d+dart+diff+docker+eiffel+elixir+erlang+fsharp+fortran+gherkin+git+glsl+go+groovy+handlebars+haskell+haxe+http+icon+inform7+ini+j+jade+java+julia+keyman+kotlin+latex+less+lolcode+lua+makefile+markdown+matlab+mel+mizar+monkey+nasm+nginx+nim+nix+nsis+objectivec+ocaml+oz+parigp+parser+pascal+perl+php+php-extras+powershell+processing+prolog+puppet+pure+python+q+qore+r+jsx+rest+rip+roboconf+crystal+rust+sas+sass+scss+scala+scheme+smalltalk+smarty+sql+stylus+swift+tcl+textile+twig+typescript+verilog+vhdl+vim+wiki+yaml',
            files      = [];

        components = components.split('+');
        components.unshift('core');

        components.forEach(function(item) {
            files.push(
                './app/bower_components/prism/components/prism-' + item + '.js'
            );
        });

        return gulp.src(files)
        .pipe(plugins.concat('bundle.js'))
        .pipe(gulp.dest('./app/bower_components/prism'));
    };
};
