/**
 * @module components/markdown/Markdown
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import MarkdownIt from 'markdown-it';
import WorkerModule from '../../workers/Module';

// Plugins
import hashtag from 'markdown-it-hashtag';
// import imsize from 'markdown-it-imsize';
import math from 'markdown-it-math';
import sanitizer from 'markdown-it-sanitizer';
import Prism from 'prismjs';
import task from './task';
import file from './file';

// Import Prismjs components (http://prismjs.com/download.html?themes=prism&languages=)
// eslint-disable-next-line
const languages = `markup+css+clike+javascript+abap+actionscript+apacheconf+apl+applescript+aspnet+autoit+autohotkey+bash+basic+batch+c+brainfuck+bison+csharp+cpp+coffeescript+ruby+css-extras+d+dart+diff+docker+eiffel+elixir+erlang+fsharp+fortran+gherkin+git+glsl+go+groovy+handlebars+haskell+haxe+http+icon+inform7+ini+j+jade+java+julia+keyman+kotlin+latex+less+lolcode+lua+makefile+markdown+matlab+mel+mizar+monkey+nasm+nginx+nim+nix+nsis+objectivec+ocaml+oz+parigp+parser+pascal+perl+php+php-extras+powershell+processing+prolog+puppet+pure+python+q+qore+r+jsx+rest+rip+roboconf+crystal+rust+sas+sass+scss+scala+scheme+smalltalk+smarty+sql+stylus+swift+tcl+textile+twig+typescript+verilog+vhdl+vim+wiki+yaml`;
_.each(languages.split('+'), lang => {
    require(`prismjs/components/prism-${lang}.min.js`);
});

/**
 * Markdown-it adapter.
 *
 * @class
 * @extends module:workers/Module
 * @license MPL-2.0
 */
export default class Markdown extends WorkerModule {

    get fileName() {
        return 'components/markdown';
    }

    /**
     * Replies to render, parse, and toggleTask Radio requests.
     *
     * @returns {Object}
     */
    get radioRequests() {
        return {
            render     : 'render',
            parse      : 'parse',
            toggleTask : 'toggleTask',
        };
    }

    constructor(...args) {
        super(...args);

        /**
         * Markdown-it instance.
         *
         * @prop {Object}
         */
        this.md = new MarkdownIt({
            html      : true,
            xhtmlOut  : true,
            breaks    : true,
            linkify   : true,
            highlight : this.highlight,
        });

        this.init();
    }

    processRequest(method, args) {
        const data = _.omit(args[0], 'notebook');

        // Do nothing if content is empty
        if (!data.content || !data.content.length) {
            return Promise.resolve('');
        }

        // Create object URLs for attachments
        data.clonedFiles = Radio.request('collections/Files', 'createUrls', {
            models: data.fileModels,
        });
        data.fileModels  = null;

        return super.processRequest(method, [data]);
    }

    /**
     * Enable plugins and configure them.
     */
    init() {
        return this
        .enablePlugins()
        .configure();
    }

    /**
     * Enable markdown-it plugins.
     *
     * @returns {Object} this
     */
    enablePlugins() {
        this.md
        .use(sanitizer)
        // .use(imsize)
        .use(math, {
            inlineOpen       : '$',
            inlineClose      : '$',
            blockOpen        : '$$',
            blockClose       : '$$',
            renderingOptions : {},
            inlineRenderer   : this.mathInlineRenderer,
            blockRenderer    : this.mathBlockRenderer,
        })
        .use(hashtag, {
            hashtagRegExp : '[\\u0021-\\uFFFF\\w\\-]+|<3',
            preceding     : '^|\\s',
        })
        .use(task.init)
        .use(file.init);

        return this;
    }

    /**
     * Configure markdown-it.
     *
     * @returns {Object} this
     */
    configure() {
        /* eslint-disable */
        // Make tables responsive
        this.md.renderer.rules.table_open = () => {
            return '<div class="table-responsive"><table>';
        };
        this.md.renderer.rules.table_close = () => '</table></div>';

        // Change hashtag styles
        this.md.renderer.rules.hashtag_open = (tokens, idx, f, env) => {
            const tagName = tokens[idx].content.toLowerCase();

            if (env) {
                env.tags = env.tags || [];
                env.tags.push(tagName);
            }

            return `<a href="#/notes/f/tag/q/${tagName}" class="label label-default">`;
        };
        /* eslint-enable */
        return this;
    }

    /**
     * Convert Markdown to HTML.
     *
     * @param {Object} data
     * @param {String} data.content
     * @returns {Promise}
     */
    render(data) {
        const content = _.unescape(data.content);
        const env     = _.extend({}, data);

        // Revoke file object URLs that aren't in use
        if (data.id) {
            file.revoke(data);
        }

        return Promise.resolve(this.md.render(content, env));
    }

    /**
     * Toggle a task's status
     *
     * @param {Object} data
     * @param {String} data.taskId
     * @param {String} data.content
     * @returns {Promise}
     */
    toggleTask(data) {
        let content = _.unescape(data.content);
        content     = task.toggle(data);
        return this.parse({content});
    }

    /**
     * Parse Markdown text for tags, task, etc...
     *
     * @param {Object} data
     * @param {String} data.content
     * @returns {Promise} - resolves with an object that contains tags and tasks
     */
    parse(data) {
        const text = _.unescape(data.content);
        const env  = {};

        return Promise.resolve(this.md.render(text, env))
        .then(htmlContent => {
            return _.extend(env, {
                htmlContent,
                content : data.content,
                tags    : env.tags ? _.uniq(env.tags)   : [],
                files   : env.files ? _.uniq(env.files) : [],
                taskAll : env.tasks ? env.tasks.length  : 0,
            });
        });
    }

    /**
     * Use Prismjs to highlight code blocks.
     *
     * @param {String} code
     * @param {String} lang
     * @returns {String}
     */
    highlight(code, lang) {
        if (!Prism.languages[lang]) {
            return '';
        }

        return Prism.highlight(code, Prism.languages[lang]);
    }

    /**
     * Inline math.
     *
     * @param {String} tokens
     * @returns {String}
     */
    mathInlineRenderer(tokens) {
        return `<span class="math inline">$${tokens}$</span>`;
    }

    /**
     * Block math.
     *
     * @param {String} tokens
     * @returns {String}
     */
    mathBlockRenderer(tokens) {
        return `<div class="math block">$$${tokens}$$</div>`;
    }

}
