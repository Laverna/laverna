/**
 * Test components/codemirror/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';
import codemirror from 'codemirror';

import Controller from '../../../../app/scripts/components/codemirror/Editor';

let sand;
test('codemirror/Controller: before()', t => {
    Radio.reply('collections/Configs', 'findConfigs', {});
    sand = sinon.sandbox.create();
    t.end();
});

test('codemirror/Controller: extraKeys + marks', t => {
    t.equal(typeof Controller.prototype.extraKeys, 'object');
    t.equal(typeof Controller.prototype.marks, 'object');
    t.end();
});

test('codemirror/Controller: constructor()', t => {
    const opt = {configs: {test: 1}};
    const con = new Controller(opt);

    t.equal(con.options, opt, 'creates "options" property');

    sand.restore();
    t.end();
});

test('codemirror/Controller: init()', t => {
    const con = new Controller({configs: {}});
    sand.stub(codemirror, 'fromTextArea').returns({test: '1'});

    con.init();

    t.equal(codemirror.fromTextArea.calledWith(document.getElementById('editor--input'), {
        mode            : {
            name        : 'gfm',
            gitHubSpice : false,
        },
        keyMap          : con.options.configs.textEditor || 'default',
        lineNumbers     : false,
        matchBrackets   : true,
        lineWrapping    : true,
        indentUnit      : parseInt(con.options.configs.indentUnit, 10),
        extraKeys       : con.extraKeys,
        inputStyle      : 'contenteditable',
        spellcheck      : true,
    }), true, 'instantiates codemirror editor');

    t.deepEqual(con.instance, {test: '1'}, 'saves codemirror instance in editor property');

    sand.restore();
    t.end();
});

test('codemirror/Controller: getCursor()', t => {
    const con  = new Controller();
    con.instance = {getCursor: sand.stub()};
    con.instance.getCursor.withArgs('start').returns(1);
    con.instance.getCursor.withArgs('end').returns(10);

    t.deepEqual(con.getCursor(), {start: 1, end: 10});

    sand.restore();
    t.end();
});

test('codemirror/Controller: getState()', t => {
    const con    = new Controller();
    con.instance = {
        getTokenAt : sand.stub().returns({type: 'variable-2 em'}),
        getLine    : sand.stub().returns(''),
    };

    t.deepEqual(con.getState(0), ['variable-2', 'em', 'unordered-list']);

    con.instance.getLine.returns('1. ');
    con.instance.getTokenAt.returns({type: 'variable-2 strong'});
    t.deepEqual(con.getState(0), ['variable-2', 'strong', 'ordered-list']);

    sand.restore();
    t.end();
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
    const con    = new Controller();
    sand.stub(con, 'getState').returns(['strong']);
    con.instance = {setSelection: sand.stub(), focus: sand.stub()};

    sand.stub(con, 'removeMarkdownTag').returns({start: 0, end: 10});
    con.toggleBlock('strong');
    t.equal(con.removeMarkdownTag.calledWith('strong'), true,
        'removes Markdown marks from text');
    t.equal(con.instance.setSelection.calledWith(0, 10), true,
        'sets a new cursor position');
    t.equal(con.instance.focus.called, true, 'brings focus back to the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: addMarkdownTag()', t => {
    const con    = new Controller();
    con.instance = {
        getSelection     : sand.stub().returns('text'),
        replaceSelection : sand.stub(),
    };
    sand.stub(con, 'getCursor').returns({start: {ch: 0}, end: {ch: 10}});

    t.equal(typeof con.addMarkdownTag('em'), 'object');
    t.equal(con.instance.replaceSelection.calledWith('*text*'), true,
        'makes the selected text italic');

    sand.restore();
    t.end();
});

test('codemirror/Controller: removeMarkdownTag()', t => {
    const con    = new Controller();
    con.instance = {getLine: sand.stub().returns('*text*')};
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
    const con    = new Controller();
    con.instance = {
        getLine      : sand.stub().returns(''),
        setSelection : sand.stub(),
    };
    sand.stub(con, 'replaceRange');

    con.toggleHeading(0);
    t.equal(con.replaceRange.calledWith('# Heading'), true,
        'creates a default headline text if there is no text on the line');
    t.equal(con.instance.setSelection.called, true, 'updates selection');

    con.instance.getLine.returns('# Head');
    con.toggleHeading(0);
    t.equal(con.replaceRange.calledWith('## Head'), true,
        'creates second level heading');

    con.instance.getLine.returns('###### Head');
    con.toggleHeading(0);
    t.equal(con.replaceRange.calledWith('Head'), true,
        'removes heading');

    sand.restore();
    t.end();
});

test('codemirror/Controller: replaceRange()', t => {
    const con    = new Controller();
    con.instance = {replaceRange: sand.stub(), focus: sand.stub()};

    con.replaceRange('test', 1);
    const called = con.instance.replaceRange.calledWith(
        'test',
        {line: 1, ch: 0},
        {line: 1, ch: 99999999999999}
    );
    t.equal(called, true, 'replace text on an entire line');
    t.equal(con.instance.focus.called, true, 'focuses on the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: attachmentAction()', t => {
    const con     = new Controller({model: {id: '1'}});
    con.instance  = {replaceSelection: sand.stub(), focus: sand.stub()};
    const req     = sand.stub(Radio, 'request');

    const res     = con.attachmentAction();
    t.equal(res, undefined, 'does nothing if fileDialog component returns nothing');
    t.equal(req.calledWith('components/fileDialog', 'show', {
        model: con.options.model,
    }), true, 'shows a file dialog');

    req.returns(Promise.resolve('link'));
    con.attachmentAction()
    .then(()     => {
        t.equal(con.instance.replaceSelection.calledWith('link', true), true,
            'replaces the selected text with the file text');
        t.equal(con.instance.focus.called, true, 'focuses on the editor');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: linkAction()', t => {
    const con    = new Controller();
    con.view     = {model: {id: '1'}};
    const req    = sand.stub(Radio, 'request');
    con.instance = {
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
        t.equal(con.instance.replaceSelection.calledWith('[Link](link)'), true,
            'replaces the selected text with the link');
        t.equal(con.instance.setSelection.calledWith(
            {line: 10, ch: 2},
            {line: 10, ch: 6}
        ), true, 'updates the selection');
        t.equal(con.instance.focus.called, true, 'focuses on the editor');

        sand.restore();
        t.end();
    });
});

test('codemirror/Controller: hrAction()', t => {
    const con    = new Controller();
    con.instance = {
        getCursor        : sand.stub().returns({line: 1, ch: 1}),
        setSelection     : sand.stub(),
        focus            : sand.stub(),
        replaceSelection : sand.stub(),
    };

    con.hrAction();
    t.equal(con.instance.replaceSelection.calledWith('\r\r-----\r\r'), true,
        'replace the selection with a divider');
    t.equal(con.instance.setSelection.called, true, 'updates the selection');
    t.equal(con.instance.focus.called, true, 'focuses on the editor');

    sand.restore();
    t.end();
});

test('codemirror/Controller: codeAction()', t => {
    const con    = new Controller();
    con.instance = {
        getSelection     : sand.stub().returns('test'),
        replaceSelection : sand.stub(),
        setSelection     : sand.stub(),
        focus            : sand.stub(),
    };
    sand.stub(con, 'getState').returns(['code']);
    sand.stub(con, 'getCursor').returns({start: 0, end: 10});

    con.codeAction();
    t.equal(con.instance.replaceSelection.notCalled, true,
        'Do nothing if the text under cursor is already a code block');

    con.getState.returns(['em']);
    con.codeAction();
    t.equal(con.instance.replaceSelection.calledWith('```\r\ntest\r\n```'), true,
        'creates a code block');
    t.equal(con.instance.setSelection.called, true, 'updates the selection');
    t.equal(con.instance.focus.called, true, 'focuses on the editor');

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
    const con = new Controller();
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
    const con    = new Controller();
    con.instance = {getLine: sand.stub().returns('1. List')};
    sand.stub(con, 'replaceRange');

    con.toggleList({type: 'ordered-list', line: 0, order: 1, state: ['ordered-list']});
    t.equal(con.replaceRange.calledWith('List'), true,
        'converts an existing list to normal text');

    con.instance.getLine.returns('');
    con.toggleList({type: 'ordered-list', line: 0, order: 1, state: []});
    t.equal(con.replaceRange.calledWith('1. '), true, 'creates an ordered list');

    con.toggleList({type: 'unordered-list', line: 0, state: []});
    t.equal(con.replaceRange.calledWith('* '), true, 'creates an unordered list');

    sand.restore();
    t.end();
});

test('codemirror/Controller: redoAction() + undoAction()', t => {
    const con    = new Controller();
    con.instance = {redo: sand.stub(), undo: sand.stub()};

    con.redoAction();
    t.equal(con.instance.redo.called, true, 'calls this.editor.redo method');

    con.undoAction();
    t.equal(con.instance.undo.called, true, 'calls this.editor.undo method');

    t.end();
});

test('codemirror/Controller: after()', t => {
    Radio.channel('collections/Configs').stopReplying();
    sand.restore();
    t.end();
});
