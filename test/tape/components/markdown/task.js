/**
 * Test components/markdown/task
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
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
    task.md = {utils: {arrayReplaceAt: () => {}}};
    sand.stub(task, 'parseTokenChildren');

    task.parse(state);
    t.equal(task.parseTokenChildren.notCalled, true,
        'does nothing if the type of a token is not inline');

    state.tokens = [{type: 'inline', content: '[ ] task'}];
    task.parse(state);
    t.equal(task.parseTokenChildren.calledWithMatch({
        state,
        token: state.tokens[0],
        arrayReplaceAt: task.md.utils.arrayReplaceAt,
    }), true, 'searches for tasks in child tokens');

    task.md = null;
    sand.restore();
    t.end();
});

test('markdown/task: parseTokenChildren()', t => {
    const data = {
        state: {Token: 'test'},
        token: {
            children: [
                {type: 'inline'},
                {type: 'text', content: 'Not a task'},
            ],
        },
        arrayReplaceAt: sand.stub(),
    };
    sand.stub(task, 'replaceToken');

    task.parseTokenChildren(data);
    t.equal(task.replaceToken.notCalled, true,
        'does nothing if the type of a child token is not text');

    data.token.children[0] = {type: 'text', content: '[] task'};
    task.parseTokenChildren(data);
    t.equal(task.replaceToken.called, true, 'calls replaceToken method');
    t.equal(data.arrayReplaceAt.called, true, 'calls arrayReplaceAt method');

    sand.restore();
    t.end();
});

test('markdown/task: replaceToken()', t => {
    const token = {content: '[] task'};
    const Token = sand.stub();

    const res = task.replaceToken(token, Token, 1);
    t.equal(Token.calledWith('task_tag', '', 0), true, 'creates a new token');
    t.equal(Array.isArray(res), true, 'returns an array');

    const [ntoken] = res;
    t.equal(ntoken.meta.label, 'task');
    t.equal(ntoken.meta.checked, false);
    t.equal(ntoken.meta.id, 1);
    t.deepEqual(ntoken.children, []);

    t.end();
});

test('markdown/task: render()', t => {
    let env = {};
    const token = {meta: {checked: true, label: 'task', id: 1}};

    const res = task.render([token], 0, null, env);
    t.equal(typeof res, 'string');
    t.equal(Array.isArray(env.tasks), true, 'creates "tasks" property');
    t.equal(env.tasks.indexOf('task') !== -1, true, 'saves the label in tasks property');
    t.equal(env.taskCompleted, 1, 'increases the number of completed tasks');

    env = {};
    task.render([{meta: {checked: false, label: 'task2', id: 2}}], 0, null, env);
    t.equal(env.taskCompleted, 0,
        'does not increase the number of completed tasks if the task is not checked');

    t.end();
});
