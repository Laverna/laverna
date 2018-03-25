/**
 * Task/checkbox plugin for markdown-it.
 *
 * @module components/markdown/task
 */
/* eslint no-param-reassign: 0 */
import _ from 'underscore';

/**
 * @exports components/markdown/task
 * @license MPL-2.0
 */
const task = {

    /**
     * Regular expression to search tasks in text.
     *
     * @prop {Object}
     */
    pattern: /\[(X|\s|\_|\-)?\]\s(.*)/i, // eslint-disable-line

    /**
     * Regular expression to search tasks in text.
     * Unlike regex in pattern property, it searches tasks globally.
     *
     * @prop {Object}
     */
    globPattern: /\[(X|\s|\_|\-)?\]\s(.*)/gi, // eslint-disable-line

    /**
     * Initialize markdown it plugin.
     *
     * @param {Object} md - Markdown-it instance
     */
    init(md) {
        task.md = md;
        md.core.ruler.push('task', _.bind(task.parse, task));
        md.renderer.rules.task_tag = _.bind(task.render, task); // eslint-disable-line
    },

    /**
     * Toggle a Markdown task.
     *
     * @param {Object} data
     * @param {String} data.content - Markdown text
     * @param {Number} data.taskId - ID of a task that needs to be toggled
     * @returns {String}
     */
    toggle(data) {
        const {content} = data;
        let count       = 0;

        return content.replace(this.globPattern, (match, checked, value) => {
            count++;

            // If it's not the task we need, do nothing
            if (count !== data.taskId) {
                return match;
            }

            checked = (checked === 'x' || checked === 'X') ? ' ' : 'x';
            return `[${checked}] ${value}`;
        });
    },

    /**
     * Parse Markdown text for tasks.
     *
     * @param {Object} state
     */
    parse(state) {
        let count = 0;

        _.each(state.tokens, token => {
            // Don't parse tokens that aren't inline
            if (token.type !== 'inline') {
                const matches = token.content.match(this.globPattern);

                // If there are any tasks, increase the number of found [x?]
                if (matches) {
                    count += matches.length;
                }

                return;
            }

            // Find child tokens which have tasks
            count = this.parseTokenChildren({count, state, token});
        });
    },

    /**
     * Find tasks in a token's children.
     *
     * @param {Object} data
     * @param {Object} data.count
     * @param {Object} data.state
     * @param {Object} data.token
     * @returns {Number} the number of found tasks
     */
    parseTokenChildren(data) {
        const {state, token} = data;
        let count = 0 + data.count;

        if (this.pattern.test(token.content)) {
            // Ignore it if it doesn't start with [x?], (1-9). or -
            if (/^[-[1-9]/.test(token.content)) {
                const data     = this.replaceWithTasks(token, state.Token, count);
                count          = data.count;
                token.children = this.md.utils.arrayReplaceAt([token], 0, data.tokens);
            }
            else {
                count++;
            }
        }

        return count;
    },

    /**
     * Replace a token with tasks.
     *
     * @param {Object} original - original token
     * @param {Object} Token
     * @param {Number} id
     * @returns {Object}
     */
    replaceWithTasks(original, Token, id) {
        let count = 0 + id;

        // If there is only child, it means there is only one task
        if (original.children.length === 1) {
            count++;
            return {count, tokens: [this.replaceToken(original.content, Token, count)]};
        }

        // Check each paragraph for tasks
        const matches = original.content.split(/[\n|\r]/);
        const tokens  = [];

        _.each(matches, content => {
            if (this.pattern.test(content)) {
                count++;

                if (/^[-[1-9]/.test(content)) {
                    tokens.push(this.replaceToken(content, Token, count));
                }
                else {
                    this.createParagraph(tokens, Token, content);
                }
            }
            // If it isn't a task, just create a paragraph
            else {
                this.createParagraph(tokens, Token, content);
            }
        });

        return {count, tokens};
    },

    /**
     * Create a paragraph token.
     *
     * @param {Array} tokens
     * @param {Object} Token
     * @param {String} content - parapgraph's content
     */
    createParagraph(tokens, Token, content) {
        const p  = new Token('paragraph_open', 'p', 1);
        p.block  = true;
        tokens.push(p);

        const token   = new Token('text', '', 0);
        token.content = content;
        token.level   = 1;
        tokens.push(token);

        const pC    = new Token('paragraph_close', 'p', -1);
        token.block = true;
        tokens.push(pC);
    },

    /**
     * Replace a token with task token.
     *
     * @param {String} content
     * @param {Object} Token - state.Token
     * @param {Number} id - ID of a task
     * @returns {Object}
     */
    replaceToken(content, Token, id) {
        const matches = content.match(this.pattern);
        const [, value, label] = matches;
        const checked = (value === 'X' || value === 'x');

        // Create a new token
        const token    = new Token('task_tag', '', 0);
        token.meta     = {label, checked, id};
        token.children = [];

        return token;
    },

    /**
     * Convert a task to HTML.
     *
     * @returns {String}
     */
    render(tokens, id, f, env) { // eslint-disable-line
        const {meta} = tokens[id];

        if (env) {
            env.tasks = env.tasks || [];
            env.tasks.push(meta.label);

            if (meta.checked) {
                env.taskCompleted = (env.taskCompleted || 0) + 1;
            }
            else {
                env.taskCompleted = (env.taskCompleted || 0);
            }
        }

        const checked = (meta.checked ? 'checked="checked"' : '');
        meta.label    = this.md.renderInline(meta.label);

        /* eslint-disable */
        return `<p><label class="task task--checkbox">
        <input data-task="${meta.id}" type="checkbox" ${checked} class="checkbox--input" />
        <svg class="checkbox--svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path class="checkbox--path" d="M16.667,62.167c3.109,5.55,7.217,10.591,10.926,15.75 c2.614,3.636,5.149,7.519,8.161,10.853c-0.046-0.051,1.959,2.414,2.692,2.343c0.895-0.088,6.958-8.511,6.014-7.3 c5.997-7.695,11.68-15.463,16.931-23.696c6.393-10.025,12.235-20.373,18.104-30.707C82.004,24.988,84.802,20.601,87,16"></path>
        </svg>
        <span class="checkbox--text">${meta.label}</span></label></p>`;
        /* eslint-enable */
    },

};

export default task;
