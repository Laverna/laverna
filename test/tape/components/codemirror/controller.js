/**
 * Test components/codemirror/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';

import Note from '../../../../app/scripts/models/Note';
import Controller from '../../../../app/scripts/components/codemirror/Controller';
import Editor from '../../../../app/scripts/components/codemirror/Editor';

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

test('codemirror/Controller: initialize()', t => {
    sand.spy(_, 'debounce');

    new Controller();
    t.equal(_.debounce.calledWith(Controller.prototype.autoSave, 1000), true,
        'creates a debounced version of autoSave method');
    t.equal(_.debounce.calledWith(Controller.prototype.onScroll, 10), true,
        'creates a debounced version of onScroll method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onDestroy()', t => {
    const con  = new Controller();
    con.editor = {instance: {toTextArea: sand.stub()}};
    sand.spy(con.channel, 'stopReplying');

    con.destroy();
    t.equal(con.channel.stopReplying.called, true, 'stops replying to requests');
    t.equal(con.editor.instance.toTextArea.called, true,
        'destroyes a codemirror instance');

    sand.restore();
    t.end();
});

test('codemirror/Controller: init()', t => {
    const methods = ['show', 'listenToEvents', 'updatePreview'];
    const con     = new Controller();
    const init    = sand.stub(Editor.prototype, 'init');
    methods.forEach(method => sand.stub(con, method).returns(con));

    con.init();
    methods.forEach(method => {
        t.equal(con[method].called, true, `calls ${method} method`);
    });

    t.equal(init.called, true, 'initalizes Codemirror');

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

test('codemirror/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    const reply  = sand.stub(con.channel, 'reply');
    con.view     = {el: 'test'};
    con.editor   = {instance: {on: sand.stub()}};

    global.Event = sand.stub();
    sand.stub(window, 'dispatchEvent');

    t.equal(con.listenToEvents(), con, 'returns itself');
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'click:button', con.onClickButton), true,
        'calls onClickButton method if the view triggers click:button');
    t.equal(listen.calledWith(con.view.model, 'synced', con.onModelSynced), true,
        'listens to "synced" event');

    t.equal(listen.calledWith(con.formChannel, 'change:mode', con.onChangeMode),
        true, 'listens to change:mode event');
    t.equal(listen.calledWith(con.channel, 'focus'), true,
        'listens to focus event');

    t.equal(window.dispatchEvent.called, true, 'emulates resize event');
    t.equal(con.editor.instance.on.calledWith('change', con.onChange), true,
        'calls onChange method if the editor triggers change');
    t.equal(con.editor.instance.on.calledWith('scroll', con.onScroll), true,
        'calls onScroll method if the editor triggers scroll');
    t.equal(con.editor.instance.on.calledWith('cursorActivity', con.onCursorActivity),
        true, 'calls onCursorActivity method if the editor triggers cursorActivity');

    t.equal(reply.calledWith({
        getContent: con.getContent,
        getData   : con.getData,
        makeLink  : con.makeLink,
        makeImage : con.makeImage,
    }), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('codemirror/Controller: getContent()', t => {
    const con  = new Controller();
    con.editor = {instance: {getValue: sand.stub().returns('Test')}};

    t.equal(con.getContent(), 'Test', 'returns the current content');
    t.equal(con.editor.instance.getValue.called, true);

    sand.restore();
    t.end();
});

test('codemirror/Controller: updatePreview()', t => {
    const con  = new Controller();
    con.view   = {
        trigger : sand.stub(),
        model   : {attributes : {}, fileModels : []},
    };
    con.editor = {instance: {getValue: () => 'Test'}};
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
    con.editor = {boldAction: sand.stub()};

    con.onClickButton();
    con.onClickButton({action: '404'});
    t.equal(con.editor.boldAction.notCalled, true);

    con.onClickButton({action: 'bold'});
    t.equal(con.editor.boldAction.called, true, 'calls boldAction method');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onModelSynced()', t => {
    const con    = new Controller();
    con.view     = {model: new Note({content: 'Test'})};
    const cursor = {line: 0, ch: 1};
    con.editor   = {instance: {
        getCursor : sand.stub().returns(cursor),
        setValue  : sand.stub(),
        setCursor : sand.stub(),
    }};

    con.onModelSynced();
    t.equal(con.editor.instance.setValue.calledWith('Test'), true,
        'updates editor value');
    t.equal(con.editor.instance.setCursor.calledWith(cursor), true,
        'updates cursor position');

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
    const con = new Controller();
    con.view  = {model: {trigger: sand.stub()}};

    sand.stub(con, 'getContent').returns('test');
    sand.stub(con, 'updatePreview');
    sand.stub(con, 'autoSave');

    con.onChange();
    t.equal(con.updatePreview.called, true, 'calls updatePreview method');
    t.equal(con.autoSave.called, true, 'calls autoSave method');
    t.equal(con.view.model.trigger.calledWith('update:stats', {content: 'test'}),
        true, 'triggers "update:stats"');

    sand.restore();
    t.end();
});

test('codemirror/Controller: autoSave()', t => {
    const con        = new Controller();
    sand.stub(con, 'autoSave').callsFake(Controller.prototype.autoSave);
    con.editor       = {instance: {getValue: () => 'test'}};
    con.view         = {model: {set: sand.stub()}};
    let cloudStorage = 'p2p';
    const trig       = sand.stub(con.formChannel, 'trigger');

    Object.defineProperty(con, 'configs', {get: () => {
        return {cloudStorage};
    }});

    con.autoSave();
    t.equal(trig.calledWith('save:auto'), true, 'triggers save:auto event');
    t.equal(con.view.model.set.notCalled, true, 'does not set new value');

    cloudStorage = 'dropbox';
    con.autoSave();
    t.equal(con.view.model.set.calledWith('content', 'test'), true, 'sets a new value');

    sand.restore();
    t.end();
});

test('codemirror/Controller: onScroll()', t => {
    const con       = new Controller();
    const scrollTop = sand.stub();
    con.view        = {ui: {previewScroll: {scrollTop}}};
    sand.stub(con, 'onScroll').callsFake(Controller.prototype.onScroll);

    con.onScroll({doc: {scrollTop: 0}});
    t.equal(scrollTop.called, true,
        'changes the preview scroll position to 0');

    const req  = sand.stub(Radio, 'request').returns(Promise.resolve('Test'));
    const sync = sand.stub(con, 'syncPreviewScroll');
    con.editor = {instance: {
        getScrollInfo : sand.stub().returns({top: 10}),
        lineAtHeight  : sand.stub(),
        getRange      : sand.stub().returns('**Test**'),
    }};

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
    con.editor = {instance: {lineCount: sand.stub()}};

    con.editor.getState  = sand.stub().returns([]);
    con.editor.getCursor = sand.stub().returns({start: {}});

    con.onCursorActivity();
    t.equal(con.view.trigger.calledWith('update:footer'), true,
        'triggers update:footer event');

    con.$btncode = {addClass: sand.stub()};
    con.editor.getState.returns(['code']);
    con.onCursorActivity();
    t.equal(con.$btncode.addClass.called, true, 'makes "code" button active');

    sand.restore();
    t.end();
});

test('codemirror/Controller: getData()', t => {
    const con  = new Controller();
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve({}));
    con.editor = {instance: {getValue: () => 'test'}};

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
