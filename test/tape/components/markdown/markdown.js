/**
 * Test components/markdown/markdown
 * @file
 */
import test from 'tape';
import Radio from 'backbone.radio';
import sinon from 'sinon';
import Markdown from '../../../../app/scripts/components/markdown/Markdown';
import Module from '../../../../app/scripts/workers/Module';
import Prism from 'prismjs';

let sand;
test('markdown/Markdown: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('markdown/Markdown: fileName', t => {
    t.equal(Markdown.prototype.fileName, 'components/markdown');
    t.end();
});

test('markdown/Markdown: radioRequests()', t => {
    const req = Markdown.prototype.radioRequests;
    t.equal(typeof req, 'object');
    t.equal(req.render, 'render');
    t.equal(req.parse, 'parse');
    t.equal(req.toggleTask, 'toggleTask');

    t.end();
});

test('markdown/Markdown: constructor()', t => {
    const init = sand.stub(Markdown.prototype, 'init');
    const md   = new Markdown();
    t.equal(typeof md.md, 'object', 'creates a Markdown-it instance');
    t.equal(init.called, true, 'calls "init" method');

    t.end();
});

test('markdown/Markdown: processRequest()', t => {
    const process = sand.stub(Module.prototype, 'processRequest');
    const md      = new Markdown();
    const req     = sand.stub(Radio, 'request').returns('files');

    md.processRequest('', [{content: ''}]);
    t.equal(process.notCalled, true, 'does nothing if content is empty');

    const data    = {content: 'test', fileModels: ['1', '2']};
    md.processRequest('', [data]);

    t.equal(req.calledWithMatch('collections/Files', 'createUrls', {
        models: data.fileModels,
    }), true, 'creates object URLs for files');

    t.equal(process.called, true, 'calls the parent processRequest method');

    sand.restore();
    t.end();
});

test('markdown/Markdown: init()', t => {
    const md = new Markdown();
    sand.spy(md, 'enablePlugins');
    sand.spy(md, 'configure');

    md.init();
    t.equal(md.enablePlugins.called, true, 'enables plugins');
    t.equal(md.configure.called, true, 'configures markdown-it and its plugins');

    sand.restore();
    t.end();
});

// @todo
test('markdown/Markdown: enablePlugins()', t => {
    const md  = new Markdown();
    const use = sand.spy(md.md, 'use');

    md.enablePlugins();
    t.equal(use.called, true, 'enables plugins');

    sand.restore();
    t.end();
});

test('markdown/Markdown: configure()', t => {
    const mark = new Markdown();
    const {md} = mark;

    mark.configure();
    t.equal(md.renderer.rules.table_open(), '<div class="table-responsive"><table>');
    t.equal(md.renderer.rules.table_close(), '</table></div>');

    const env = {};
    const tokens = [{content: 'Test'}];
    t.equal(md.renderer.rules.hashtag_open(tokens, 0, null, env),
        '<a href="#/notes/f/tag/q/test" class="label label-default">');

    t.end();
});

test('markdown/Markdown: render()', t => {
    const md = new Markdown();
    sand.spy(md.md, 'render');

    const res = md.render({content: '## Task'});
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(md.md.render.calledWith('## Task'), true, 'renders the markdown text');

    sand.restore();
    t.end();
});

test('markdown/Markdown: toggleTask()', t => {
    const md = new Markdown();
    sand.stub(md, 'parse');

    md.toggleTask({content: 'Test'});
    t.equal(md.parse.calledWith({content: 'Test'}), true, 'calls parse method');

    sand.restore();
    t.end();
});

test('markdown/Markdown: parse()', t => {
    const md     = new Markdown();
    sand.spy(md.md, 'render');

    const res = md.parse({content: '### Test'});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(data => {
        t.equal(typeof data, 'object');
        t.equal(Array.isArray(data.tags), true, 'creates an array of tags');
        t.equal(Array.isArray(data.files), true, 'creates an array of files');

        return md.parse({content: `### Test #tag #tag2 #tag
        #file:1-2-3
        - [] Task 1`});
    })
    .then(data => {
        t.comment(`tags ${data.tags[1]}`);
        t.equal(data.tags.indexOf('tag') !== -1, true,
            'adds "tag" to the array of tags');
        t.equal(data.tags.indexOf('tag2') !== -1, true,
            'adds "tag2" to the array of tags');
        t.equal(data.tags.length, 2, 'does not create duplicate tags');

        sand.restore();
        t.end();
    });
});

test('markdown/Markdown: highlight()', t => {
    const md   = new Markdown();
    const stub = sand.stub(Prism, 'highlight');

    md.highlight('const h=""', 'none');
    t.equal(stub.notCalled, true,
        'does nothing if prism cannot highlight a programming language');

    md.highlight('const h=""', 'javascript');
    t.equal(stub.called, true, 'highlights code blocks');

    sand.restore();
    t.end();
});

test('markdown/Markdown: mathInlineRenderer()', t => {
    const md = new Markdown();
    t.equal(md.mathInlineRenderer('test'), '<span class="math inline">$test$</span>');
    t.end();
});

test('markdown: mathBlockRenderer()', t => {
    const md = new Markdown();
    t.equal(md.mathBlockRenderer('test'), '<div class="math block">$$test$$</div>');
    t.end();
});
