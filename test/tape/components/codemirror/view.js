/**
 * Test components/codemirror/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';

import View from '../../../../app/scripts/components/codemirror/View';

let sand;
test('codemirror/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('codemirror/View: className', t => {
    t.equal(View.prototype.className, 'layout--body container-fluid');
    t.end();
});

test('codemirror/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.preview, '#wmd-preview');
    t.equal(ui.previewScroll, '.editor--preview');
    t.equal(ui.bar, '.editor--bar');
    t.end();
});

test('codemirror/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click .editor--btns .btn'], 'onClickButton',
        'handles clicks on WYSIWYG buttons');
    t.equal(events['click .editor--col--btn'], 'showColumn',
        'shows preview or editor column if their buttons are clicked');
    t.end();
});

test('codemirror/View: initialize()', t => {
    const listen = sand.stub(View.prototype, 'listenTo');
    const view = new View({
        configs: {editMode: 'normal'},
    });

    t.equal(view.options.mode, view.options.configs.editMode);
    t.equal(typeof view.$footer, 'object', 'msg');
    t.equal(typeof view.$layoutBody, 'object', 'msg');

    t.equal(listen.calledWith(view, 'change:mode', view.onChangeMode), true,
        'listens to change:mode event');
    t.equal(listen.calledWith(view, 'change:editor', view.onChangeEditor), true,
        'listens to change:editor event');
    t.equal(listen.calledWith(view, 'update:footer', view.updateFooter), true,
        'listens to update:footer event');

    sand.restore();
    t.end();
});

test('codemirror/View: onDestroy()', t => {
    const view = new View({configs: {}});
    sand.spy(view.$layoutBody, 'off');

    view.destroy();
    t.equal(view.$layoutBody.off.calledWith('scroll'), true,
        'stops listening to scroll event');

    sand.restore();
    t.end();
});

test('codemirror/View: onClickButton()', t => {
    const view           = new View({configs: {}});
    const preventDefault = sand.stub();
    const attr           = sand.stub();
    sand.stub(view, '$').withArgs('test')
    .returns({attr});
    sand.stub(view, 'trigger');

    view.onClickButton({preventDefault, currentTarget: 'test'});
    t.equal(preventDefault.called, true, 'prevents the default behavior');
    t.equal(view.trigger.notCalled, true,
        'does not trigger click:button event if action is undefined');

    attr.returns('test');
    view.onClickButton({preventDefault, currentTarget: 'test'});
    t.equal(view.trigger.calledWith('click:button', {action: 'test'}), true,
        'triggers click:button event');

    sand.restore();
    t.end();
});

test('codemirror/View: showColumn()', t => {
    const view        = new View({configs: {}});
    const jq          = sand.stub(view, '$');
    const removeClass = sand.stub();
    const addClass    = sand.stub();

    jq.withArgs('.test--btn').returns({addClass, attr: () => 'right'});
    jq.withArgs('.editor--col--btn.active').returns({removeClass});
    jq.withArgs('.-left').returns({removeClass});
    jq.withArgs('.-right').returns({addClass});

    view.showColumn({currentTarget: '.test--btn'});
    t.equal(removeClass.calledWith('active'), true,
        'removes active class from the currently active button');
    t.equal(addClass.calledWith('active'), true,
        'adds active class to the clicked button');

    t.equal(removeClass.calledWith('-show'), true, 'hides the left column');
    t.equal(addClass.calledWith('-show'), true, 'shows the right column');

    sand.restore();
    t.end();
});

test('codemirror/View: onChangeMode()', t => {
    const view      = new View({configs: {}});
    const scrollTop = sand.stub(view.$layoutBody, 'scrollTop');
    view.ui         = {bar: {css: sand.stub(), removeClass: sand.stub()}};

    view.onChangeMode({mode: 'normal'});
    t.equal(scrollTop.notCalled, true, 'does nothing if it is normal mode');

    view.onChangeMode({mode: 'fullscreen'});
    t.equal(scrollTop.calledWith(0), true,
        'makes the editor visible by scrolling back');
    t.equal(view.ui.bar.css.calledWith('width', 'initial'), true,
        'changes the width of the WYSIWYG bar to initial');
    t.equal(view.ui.bar.removeClass.calledWith('-fixed'), true,
        'removes -fixed class from the bar');

    sand.restore();
    t.end();
});

test('codemirror/View: onChangeEditor()', t => {
    const view = new View({configs: {}});
    const trig = sand.stub(Radio, 'trigger');
    view.ui    = {preview: {html: sand.stub()}};
    const data = {content: 'Test'};

    view.isFirst = true;
    view.onChangeEditor(data);
    t.equal(view.ui.preview.html.calledWith(data.content), true,
        'changes the preview');
    t.equal(trig.calledWith('components/editor', 'render', view), false,
        'does not trigger render event');
    t.equal(trig.calledWith('components/editor', 'preview:refresh', data), true,
        'triggers preview:refresh event');

    view.isFirst = false;
    view.onChangeEditor(data);
    t.equal(trig.calledWith('components/editor', 'render', view), true,
        'triggers render event');

    sand.restore();
    t.end();
});

test('codemirror/View: updateFooter()', t => {
    const view = new View({configs: {}});
    const html = sand.stub(view.$footer, 'html');
    const opt  = {currentLine: 1, numberOfLines: 2};
    sand.stub(_, 'i18n').callsFake(str => str);

    view.updateFooter(opt);
    t.equal(html.calledWith('Line of'), true, 'changes the footer');
    t.equal(_.i18n.calledWith('Line of', opt), true,
        'translates the footer content');

    sand.restore();
    t.end();
});

test('codemirror/View: onScroll()', t => {
    const view = new View({configs: {}});
    view.ui = {bar: {
        css         : sand.stub(),
        addClass    : sand.stub(),
        removeClass : sand.stub(),
        offset      : sand.stub().returns({top: 0}),
    }};
    sand.stub(view.$layoutBody, 'scrollTop').returns(10);
    sand.stub(view.$layoutBody, 'width').returns('100%');

    view.options.mode = 'preview';
    view.onScroll();
    t.equal(view.ui.bar.css.notCalled, true,
        'does nothing if editor mode is not normal mode');

    view.options.mode = 'normal';
    view.onScroll();
    t.equal(view.ui.bar.css.calledWith('width', '100%'), true,
        'changes the width of the bar to layout\'s');
    t.equal(view.ui.bar.addClass.calledWith('-fixed'), true, 'fixes the bar on top');

    view.$layoutBody.scrollTop.returns(0);
    view.onScroll();
    t.equal(view.ui.bar.css.calledWith('width', 'initial'), true,
        'changes the width of the bar to initial');
    t.equal(view.ui.bar.removeClass.calledWith('-fixed'), true,
        'removes -fixed class from the bar');

    sand.restore();
    t.end();
});
