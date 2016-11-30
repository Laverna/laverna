/**
 * Test components/codemirror/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';
import codemirror from 'codemirror';

import Controller from '../../../../app/scripts/components/codemirror/Controller';

let sand;
test('codemirror/Controller: before()', t => {
    Radio.reply('collections/Configs', 'findConfigs', {});
    sand = sinon.sandbox.create();
    t.end();
});

test('codemirror/Controller: channel', t => {
    t.equal(Controller.prototype.channel.channelName, 'components/editor');
    t.end();
});

test('codemirror/Controller: formChannel', t => {
    t.equal(Controller.prototype.formChannel.channelName, 'components/notes/form');
    t.end();
});

test('codemirror/Controller: configs', t => {
    const req = sand.stub(Radio, 'request').returns({test: '1'});
    t.deepEqual(Controller.prototype.configs, {test: '1'});
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'makes findConfigs request');

    sand.restore();
    t.end();
});

test('codemirror/Controller: extraKeys + marks', t => {
    t.equal(typeof Controller.prototype.extraKeys, 'object');
    t.equal(typeof Controller.prototype.marks, 'object');
    t.end();
});

test('codemirror/Controller: initialize()', t => {
    sand.spy(_, 'debounce');

    new Controller();
    t.equal(_.debounce.calledWith(Controller.prototype.autoSave, 1000), true,
        'creates a debounced version autoSave method');
    t.equal(_.debounce.calledWith(Controller.prototype.onScroll, 10), true,
        'creates a debounced version onScroll method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onDestroy()', t => {
    const con  = new Controller();
    con.editor = {toTextArea: sand.stub()};
    sand.spy(con.channel, 'stopReplying');

    con.destroy();
    t.equal(con.channel.stopReplying.called, true, 'stops replying to requests');
    t.equal(con.editor.toTextArea.called, true, 'destroyes a codemirror instance');

    sand.restore();
    t.end();
});

test('codemirror/Controller: init()', t => {
    const methods = ['show', 'initEditor', 'listenToEvents', 'updatePreview'];
    const con     = new Controller();
    methods.forEach(method => sand.stub(con, method).returns(con));

    con.init();
    methods.forEach(method => {
        t.equal(con[method].called, true, `calls ${method} method`);
    });

    sand.restore();
    t.end();
});

test('codemirror/Controller: show()', t => {
    const con = new Controller();
    const req = sand.stub(con.formChannel, 'request');

    t.equal(con.show(), con, 'returns itself');
    t.equal(req.calledWith('showChildView', 'editor', con.view), true,
        'renders the editor view');

    sand.restore();
    t.end();
});

test('codemirror/Controller: initEditor()', t => {
    const con = new Controller();
    sand.stub(codemirror, 'fromTextArea').returns({test: '1'});

    t.equal(con.initEditor(), con, 'returns itself');
    t.equal(codemirror.fromTextArea.called, true, 'instantiates codemirror editor');
    t.deepEqual(con.editor, {test: '1'}, 'saves codemirror instance in editor property');

    sand.restore();
    t.end();
});

test('codemirror/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    const reply  = sand.stub(con.channel, 'reply');
    con.view     = {el: 'test'};
    con.editor   = {on: sand.stub()};

    global.Event = sand.stub();
    sand.stub(window, 'dispatchEvent');

    t.equal(con.listenToEvents(), con, 'returns itself');
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'click:button', con.onClickButton), true,
        'calls onClickButton method if the view triggers click:button');

    t.equal(listen.calledWith(con.formChannel, 'change:mode', con.onChangeMode),
        true, 'listens to change:mode event');
    t.equal(listen.calledWith(con.channel, 'focus'), true,
        'listens to focus event');

    t.equal(window.dispatchEvent.called, true, 'emulates resize event');
    t.equal(con.editor.on.calledWith('change', con.onChange), true,
        'calls onChange method if the editor triggers change');
    t.equal(con.editor.on.calledWith('scroll', con.onScroll), true,
        'calls onScroll method if the editor triggers scroll');
    t.equal(con.editor.on.calledWith('cursorActivity', con.onCursorActivity), true,
        'calls onCursorActivity method if the editor triggers cursorActivity');

    t.equal(reply.calledWith({
        getData   : con.getData,
        makeLink  : con.makeLink,
        makeImage : con.makeImage,
    }), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('codemirror/Controller: updatePreview()', t => {
    const con  = new Controller();
    con.view   = {
        trigger : sand.stub(),
        model   : {attributes : {}, fileModels : []},
    };
    con.editor = {getValue: () => 'Test'};
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve('Test!'));

    con.updatePreview().then(() => {
        t.equal(req.calledWith('components/markdown', 'render'), true,
            'renders markdown content');
        t.equal(con.view.trigger.calledWith('change:editor', {content: 'Test!'}), true,
            'triggers change:editor');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: onClickButton()', t => {
    const con  = new Controller();
    sand.stub(con, 'boldAction');

    con.onClickButton();
    con.onClickButton({action: '404'});
    t.equal(con.boldAction.notCalled, true);

    con.onClickButton({action: 'bold'});
    t.equal(con.boldAction.called, true, 'calls boldAction method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onChangeMode()', t => {
    const con  = new Controller();
    con.view = {trigger: sand.stub()};
    sand.stub(window, 'dispatchEvent');

    con.onChangeMode({mode: 'normal'});
    t.equal(window.dispatchEvent.called, true, 'emulates resize event');
    t.equal(con.view.trigger.calledWith('change:mode', {mode: 'normal'}), true,
        'triggers change:mode event to the view');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onChange()', t => {
    const con  = new Controller();
    sand.stub(con, 'updatePreview');
    sand.stub(con, 'autoSave');

    con.onChange();
    t.equal(con.updatePreview.called, true, 'calls updatePreview method');
    t.equal(con.autoSave.called, true, 'calls autoSave method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: autoSave()', t => {
    const con  = new Controller();
    sand.stub(con, 'autoSave', Controller.prototype.autoSave);
    const trig = sand.stub(con.formChannel, 'trigger');

    con.autoSave();
    t.equal(trig.called, true, 'triggers save:auto event');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onScroll()', t => {
    const con       = new Controller();
    const scrollTop = sand.stub();
    con.view        = {ui: {previewScroll: {scrollTop}}};
    sand.stub(con, 'onScroll', Controller.prototype.onScroll);

    con.onScroll({doc: {scrollTop: 0}});
    t.equal(scrollTop.called, true,
        'changes the preview scroll position to 0');

    const req  = sand.stub(Radio, 'request').returns(Promise.resolve('Test'));
    const sync = sand.stub(con, 'syncPreviewScroll');
    con.editor = {
        getScrollInfo : sand.stub().returns({top: 10}),
        lineAtHeight  : sand.stub(),
        getRange      : sand.stub().returns('**Test**'),
    };

    con.onScroll({doc: {scrollTop: 10}})
    .then(() => {
        t.equal(req.calledWith('components/markdown', 'render', {
            content: '**Test**',
        }), true, 'converts the visible Markdown text to HTML');
        t.equal(sync.calledWithMatch({}, 'Test'), true,
            'Synchronize the editor\'s scroll position with the preview\'s');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: syncPreviewScroll()', t => {
    const con       = new Controller();
    con.view        = {ui: {
        preview       : [{children: [{offsetTop: 10}]}],
        previewScroll : {animate: sand.stub(), scrollTop: sand.stub().returns(10)},
    }};
    sand.stub(con, 'createSyncFragment').returns({children: []});

    con.syncPreviewScroll({scrollTop: 0});
    t.equal(con.createSyncFragment.called, true, 'creates a temporary HTML fragment');
    t.equal(con.view.ui.previewScroll.animate.calledWithMatch({
        scrollTop: 10,
    }), true, 'scrolls to the last visible element\'s position');

    con.scrollTop = 50;
    con.syncPreviewScroll({scrollTop: 100});
    t.equal(con.view.ui.previewScroll.scrollTop.calledWith(60), true,
        'changes scroll position according to the difference of it in the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: createSyncFragment()', t => {
    const con  = new Controller();

    const res = con.createSyncFragment('<strong>text</strong>');
    t.equal(typeof res, 'object');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onCursorActivity()', t => {
    const con  = new Controller();
    con.$btns  = {removeClass: sand.stub()};
    con.view   = {trigger: sand.stub()};
    con.editor = {lineCount: sand.stub()};
    sand.stub(con, 'getState').returns([]);
    sand.stub(con, 'getCursor').returns({start: {}});

    con.onCursorActivity();
    t.equal(con.view.trigger.calledWith('update:footer'), true,
        'triggers update:footer event');

    con.$btncode = {addClass: sand.stub()};
    con.getState.returns(['code']);
    con.onCursorActivity();
    t.equal(con.$btncode.addClass.called, true, 'makes "code" button active');

    sand.restore();
    t.end();
});

test('codemirror/Controller: getCursor()', t => {
    const con  = new Controller();
    con.editor = {getCursor: sand.stub()};
    con.editor.getCursor.withArgs('start').returns(1);
    con.editor.getCursor.withArgs('end').returns(10);

    t.deepEqual(con.getCursor(), {start: 1, end: 10});

    sand.restore();
    t.end();
});

test('codemirror/Controller: getState()', t => {
    const con  = new Controller();
    con.editor = {
        getTokenAt : sand.stub().returns({type: 'variable-2 em'}),
        getLine    : sand.stub().returns(''),
    };

    t.deepEqual(con.getState(0), ['variable-2', 'em', 'unordered-list']);

    con.editor.getLine.returns('1. ');
    con.editor.getTokenAt.returns({type: 'variable-2 strong'});
    t.deepEqual(con.getState(0), ['variable-2', 'strong', 'ordered-list']);

    sand.restore();
    t.end();
});

test('codemirror/Controller: getData()', t => {
    const con  = new Controller();
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve({}));
    con.editor = {getValue: () => 'test'};

    con.getData()
    .then(data => {
        t.equal(req.calledWith('components/markdown', 'parse', {content: 'test'}),
            true, 'parses Markdown content');
        t.equal(typeof data, 'object', 'resolves with an object');
        t.equal(data.content, 'test');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: boldAction() + italicAction()', t => {
    const con  = new Controller();
    sand.stub(con, 'toggleBlock');

    con.boldAction();
    t.equal(con.toggleBlock.calledWith('strong'), true, 'toggle "strong" block');

    con.italicAction();
    t.equal(con.toggleBlock.calledWith('em'), true, 'toggle "em" block');

    sand.restore();
    t.end();
});

test('codemirror/Controller: toggleBlock()', t => {
    const con  = new Controller();
    sand.stub(con, 'getState').returns(['strong']);
    con.editor = {setSelection: sand.stub(), focus: sand.stub()};

    sand.stub(con, 'removeMarkdownTag').returns({start: 0, end: 10});
    con.toggleBlock('strong');
    t.equal(con.removeMarkdownTag.calledWith('strong'), true,
        'removes Markdown marks from text');
    t.equal(con.editor.setSelection.calledWith(0, 10), true,
        'sets a new cursor position');
    t.equal(con.editor.focus.called, true, 'brings focus back to the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: addMarkdownTag()', t => {
    const con    = new Controller();
    con.editor   = {
        getSelection     : sand.stub().returns('text'),
        replaceSelection : sand.stub(),
    };
    sand.stub(con, 'getCursor').returns({start: {ch: 0}, end: {ch: 10}});

    t.equal(typeof con.addMarkdownTag('em'), 'object');
    t.equal(con.editor.replaceSelection.calledWith('*text*'), true,
        'makes the selected text italic');

    sand.restore();
    t.end();
});

test('codemirror/Controller: removeMarkdownTag()', t => {
    const con  = new Controller();
    con.editor = {getLine: sand.stub().returns('*text*')};
    sand.stub(con, 'replaceRange');
    sand.stub(con, 'getCursor').returns({start: {line: 0}, end: {}});

    t.equal(typeof con.removeMarkdownTag('em'), 'object');
    t.equal(con.replaceRange.calledWith('*texttext*', 0), true,
        'removes Markdown tags from the text');

    sand.restore();
    t.end();
});

test('codemirror/Controller: headingAction()', t => {
    const con  = new Controller();
    sand.stub(con, 'getCursor').returns({start: {line: 0}, end: {line: 1}});
    sand.stub(con, 'toggleHeading');

    con.headingAction();
    t.equal(con.toggleHeading.callCount, 2, 'calls toggleHeading method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: toggleHeading()', t => {
    const con  = new Controller();
    con.editor = {
        getLine      : sand.stub().returns(''),
        setSelection : sand.stub(),
    };
    sand.stub(con, 'replaceRange');

    con.toggleHeading(0);
    t.equal(con.replaceRange.calledWith('# Heading'), true,
        'creates a default headline text if there is no text on the line');
    t.equal(con.editor.setSelection.called, true, 'updates selection');

    con.editor.getLine.returns('# Head');
    con.toggleHeading(0);
    t.equal(con.replaceRange.calledWith('## Head'), true,
        'creates second level heading');

    con.editor.getLine.returns('###### Head');
    con.toggleHeading(0);
    t.equal(con.replaceRange.calledWith('Head'), true,
        'removes heading');

    sand.restore();
    t.end();
});

test('codemirror/Controller: replaceRange()', t => {
    const con  = new Controller();
    con.editor = {replaceRange: sand.stub(), focus: sand.stub()};

    con.replaceRange('test', 1);
    const called = con.editor.replaceRange.calledWith(
        'test',
        {line: 1, ch: 0},
        {line: 1, ch: 99999999999999}
    );
    t.equal(called, true, 'replace text on an entire line');
    t.equal(con.editor.focus.called, true, 'focuses on the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: attachmentAction()', t => {
    const con  = new Controller();
    con.view   = {model: {id: '1'}};
    con.editor = {replaceSelection: sand.stub(), focus: sand.stub()};
    const req  = sand.stub(Radio, 'request');

    const res = con.attachmentAction();
    t.equal(res, undefined, 'does nothing if fileDialog component returns nothing');
    t.equal(req.calledWith('components/fileDialog', 'show', {
        model: con.view.model,
    }), true, 'shows a file dialog');

    req.returns(Promise.resolve('link'));
    con.attachmentAction()
    .then(() => {
        t.equal(con.editor.replaceSelection.calledWith('link', true), true,
            'replaces the selected text with the file text');
        t.equal(con.editor.focus.called, true, 'focuses on the editor');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: linkAction()', t => {
    const con  = new Controller();
    con.view   = {model: {id: '1'}};
    const req  = sand.stub(Radio, 'request');
    con.editor = {
        getCursor        : sand.stub().returns({line: 10, ch: 1}),
        getSelection     : sand.stub(),
        replaceSelection : sand.stub(),
        setSelection     : sand.stub(),
        focus            : sand.stub(),
    };

    req.returns(Promise.resolve('link'));
    con.linkAction()
    .then(() => {
        t.equal(req.calledWith('components/linkDialog', 'show'), true,
            'shows a link dialog');
        t.equal(con.editor.replaceSelection.calledWith('[Link](link)'), true,
            'replaces the selected text with the link');
        t.equal(con.editor.setSelection.calledWith(
            {line: 10, ch: 2},
            {line: 10, ch: 6}
        ), true, 'updates the selection');
        t.equal(con.editor.focus.called, true, 'focuses on the editor');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: hrAction()', t => {
    const con  = new Controller();
    con.editor = {
        getCursor        : sand.stub().returns({line: 1, ch: 1}),
        setSelection     : sand.stub(),
        focus            : sand.stub(),
        replaceSelection : sand.stub(),
    };

    con.hrAction();
    t.equal(con.editor.replaceSelection.calledWith('\r\r-----\r\r'), true,
        'replace the selection with a divider');
    t.equal(con.editor.setSelection.called, true, 'updates the selection');
    t.equal(con.editor.focus.called, true, 'focuses on the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: codeAction()', t => {
    const con  = new Controller();
    con.editor = {
        getSelection     : sand.stub().returns('test'),
        replaceSelection : sand.stub(),
        setSelection     : sand.stub(),
        focus            : sand.stub(),
    };
    sand.stub(con, 'getState').returns(['code']);
    sand.stub(con, 'getCursor').returns({start: 0, end: 10});

    con.codeAction();
    t.equal(con.editor.replaceSelection.notCalled, true,
        'Do nothing if the text under cursor is already a code block');

    con.getState.returns(['em']);
    con.codeAction();
    t.equal(con.editor.replaceSelection.calledWith('```\r\ntest\r\n```'), true,
        'creates a code block');
    t.equal(con.editor.setSelection.called, true, 'updates the selection');
    t.equal(con.editor.focus.called, true, 'focuses on the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: listAction() + numberedListAction()', t => {
    const con  = new Controller();
    sand.stub(con, 'toggleLists');

    con.listAction();
    t.equal(con.toggleLists.calledWith('unordered-list'), true,
        'calls toggleLists method');

    con.numberedListAction();
    t.equal(con.toggleLists.calledWith('ordered-list', 1), true,
        'calls toggleLists method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: toggleLists()', t => {
    const con  = new Controller();
    sand.stub(con, 'getCursor').returns({start: {line: 0}, end: {line: 5}});
    sand.stub(con, 'getState').returns({line: 0});
    sand.stub(con, 'toggleList');

    con.toggleLists('ordered-list', 1);
    t.equal(con.toggleList.callCount, 6, 'converts several line to an ordered list');
    t.equal(con.toggleList.calledWithMatch({
        type  : 'ordered-list',
        line  : 0,
        order : 1,
    }), true, 'creates the first line');

    sand.restore();
    t.end();
});

test('codemirror/Controller: toggleList()', t => {
    const con  = new Controller();
    con.editor = {getLine: sand.stub().returns('1. List')};
    sand.stub(con, 'replaceRange');

    con.toggleList({type: 'ordered-list', line: 0, order: 1, state: ['ordered-list']});
    t.equal(con.replaceRange.calledWith('List'), true,
        'converts an existing list to normal text');

    con.editor.getLine.returns('');
    con.toggleList({type: 'ordered-list', line: 0, order: 1, state: []});
    t.equal(con.replaceRange.calledWith('1. '), true, 'creates an ordered list');

    con.toggleList({type: 'unordered-list', line: 0, state: []});
    t.equal(con.replaceRange.calledWith('* '), true, 'creates an unordered list');

    sand.restore();
    t.end();
});

test('codemirror/Controller: redoAction() + undoAction()', t => {
    const con  = new Controller();
    con.editor = {redo: sand.stub(), undo: sand.stub()};

    con.redoAction();
    t.equal(con.editor.redo.called, true, 'calls this.editor.redo method');

    con.undoAction();
    t.equal(con.editor.undo.called, true, 'calls this.editor.undo method');

    t.end();
});

test('codemirror/Controller: makeLink()', t => {
    const con = new Controller();
    t.equal(con.makeLink({text: 'text', url: 'url'}), '[text](url)');
    t.end();
});

test('codemirror/Controller: makeImage()', t => {
    const con = new Controller();
    t.equal(con.makeImage({text: 'text', url: 'url'}), '![text](url)');
    t.end();
});

test('codemirror/Controller: after()', t => {
    Radio.channel('collections/Configs').stopReplying();
    sand.restore();
    t.end();
});
