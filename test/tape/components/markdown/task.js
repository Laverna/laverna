/**
 * Test components/markdown/task
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import $ from 'jquery';
import Markdown from '../../../../app/scripts/components/markdown/Markdown';
import task from '../../../../app/scripts/components/markdown/task';

let sand;
test('markdown/task: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('markdown/task: pattern', t => {
    t.equal(task.pattern instanceof RegExp, true, 'is a regular expression');
    t.end();
});

test('markdown/task: globPattern', t => {
    t.equal(task.globPattern instanceof RegExp, true, 'is a regular expression');
    t.notEqual(task.globPattern, task.pattern);
    t.end();
});

test('markdown/task: init()', t => {
    const md = {
        core     : {ruler: {push: sand.stub()}},
        renderer : {rules: {}},
    };
    task.init(md);

    t.equal(task.md, md, 'saves Markdown-it instance');
    t.equal(md.core.ruler.push.calledWith('task'), true, 'creates a new core ruler');
    t.equal(typeof md.renderer.rules.task_tag, 'function', 'creates task_tag renderer');

    task.md = null;
    t.end();
});

test('markdown/task: toggle()', t => {
    const content = `- [] task 1
    - [] Task 2
    [] task 3
    `;

    const active = task.toggle({content, taskId: 3});
    t.equal(active.search(/\[x\] task 3/g) !== -1, true,
        'makes an unactive task active');

    const unactive = task.toggle({content: active, taskId: 3});
    t.equal(unactive.search(/\[ \] task 3/g) !== -1, true,
        'makes an active task unactive');

    t.end();
});

test('markdown/task: parse()', t => {
    const state = {tokens: [{type: 'block', content: '[x] task'}]};
    sand.stub(task, 'parseTokenChildren');

    task.parse(state);
    t.equal(task.parseTokenChildren.notCalled, true,
        'does nothing if the type of a token is not inline');

    state.tokens = [{type: 'inline', content: '[ ] task'}];
    task.parse(state);
    t.equal(task.parseTokenChildren.calledWithMatch({
        state,
        token: state.tokens[0],
    }), true, 'searches for tasks in child tokens');

    task.md = null;
    sand.restore();
    t.end();
});

test('markdown/task: parseTokenChildren()', t => {
    task.md    = {utils: {arrayReplaceAt: sand.stub()}};
    const data = {
        count: 0,
        state: {Token: 'test'},
        token: {
            content : 'Hello $$[]$$',
            children: [
                {type: 'inline'},
                {type: 'text', content: 'Not a task'},
            ],
        },
    };
    sand.stub(task, 'replaceWithTasks').returns({count: 1, tokens: []});

    // task.parseTokenChildren(data);
    t.equal(task.parseTokenChildren(data), 0, 'returns 0 if there are no tasks');
    t.equal(task.replaceWithTasks.notCalled, true,
        'does nothing if the type of a child token is not text');

    data.token.content = '[] task';
    task.parseTokenChildren(data);
    t.equal(task.replaceWithTasks.called, true, 'calls replaceToken method');
    t.equal(task.md.utils.arrayReplaceAt.called, true, 'calls arrayReplaceAt method');

    sand.restore();
    t.end();
});

test('markdown/task: replaceToken()', t => {
    const Token = sand.stub();

    const res = task.replaceToken('[] task', Token, 1);
    t.equal(Token.calledWith('task_tag', '', 0), true, 'creates a new token');
    t.equal(typeof res, 'object', 'returns an object');

    t.equal(res.meta.label, 'task');
    t.equal(res.meta.checked, false);
    t.equal(res.meta.id, 1);
    t.deepEqual(res.children, []);

    sand.restore();
    t.end();
});

test('markdown/task: render()', t => {
    task.md     = {renderInline: sand.stub()};
    let env     = {};
    const token = {meta: {checked: true, label: 'task', id: 1}};

    const res = task.render([token], 0, null, env);
    t.equal(typeof res, 'string');
    t.equal(Array.isArray(env.tasks), true, 'creates "tasks" property');
    t.equal(env.tasks.indexOf('task') !== -1, true, 'saves the label in tasks property');
    t.equal(env.taskCompleted, 1, 'increases the number of completed tasks');
    t.equal(task.md.renderInline.calledWith('task'), true,
        'renders the label of the task');

    env = {};
    task.render([{meta: {checked: false, label: 'task2', id: 2}}], 0, null, env);
    t.equal(env.taskCompleted, 0,
        'does not increase the number of completed tasks if the task is not checked');

    sand.restore();
    t.end();
});

test('markdown/task: render() - renders a task', t => {
    const md = new Markdown();

    md.render({content: '## Header #2\n[] A task!'})
    .then(res => {
        const $task = $(res).find('.task .checkbox--text');
        t.equal($task.length, 1, 'renders the task');
        t.equal($task.html(), 'A task!', 'shows the label of the task');
        t.end();
    });
});

test('markdown/task: render() - renders tasks inside of lists', t => {
    const md = new Markdown();

    md.render({content: '- [] Task N1\n- [] Task N2'})
    .then(res => {
        const $tasks = $(res).find('li .task .checkbox--text');
        t.equal($tasks.length, 2);
        t.equal($($tasks.get(0)).html(), 'Task N1');
        t.equal($($tasks.get(1)).html(), 'Task N2');

        t.end();
    })
});

test('markdown/task: render() - renders tasks inside of numbered lists', t => {
    const md = new Markdown();

    md.render({content: '1. [] Task N1\n2. [] Task N2'})
    .then(res => {
        const $tasks = $(res).find('li .task .checkbox--text');
        t.equal($tasks.length, 2);
        t.equal($($tasks.get(0)).html(), 'Task N1');
        t.equal($($tasks.get(1)).html(), 'Task N2');

        t.end();
    });
});

test('markdown/task: render() - shows tasks with the preformated HTML blocks', t => {
    const md = new Markdown();

    md.render({content: '- [x] Incorrect parsing `text` in check lists'})
    .then(res => {
        const $task = $(res).find('li .task .checkbox--text');
        t.equal($task.html(), 'Incorrect parsing <code>text</code> in check lists');

        t.end();
    });
});

test('markdown/task: render() - shows inline tasks', t => {
    const md = new Markdown();

    md.render({content: '[ ] Task N1\n[ ] Task N2\nIt is not a task.'})
    .then(res => {
        const $tasks = $(res).find('.task .checkbox--text');
        t.equal($tasks.length, 2);
        t.equal($($tasks.get(0)).html(), 'Task N1');

        const $last = $($tasks.get(1));
        t.equal($last.html(), 'Task N2');

        t.equal($last.parent().parent().next().html(), '\nIt is not a task.');
        t.end();
    });
});
