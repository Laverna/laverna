/**
 * Test components/setup/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import View from '../../../../app/scripts/components/setup/View';

let sand;
test('setup/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/View: className', t => {
    t.equal(View.prototype.className, 'container text-center -auth');
    t.end();
});

test('setup/View: regions()', t => {
    const reg = View.prototype.regions();
    t.equal(typeof reg, 'object');
    t.equal(reg.content, '#welcome--content');
    t.end();
});

test('setup/View: triggers()', t => {
    const trig = View.prototype.triggers();
    t.equal(typeof trig, 'object');
    t.equal(trig['click #welcome--import'], 'import',
        'triggers "import" event');
    t.equal(trig['click #welcome--last'], 'export',
        'triggers "export" event');
    t.end();
});

test('setup/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click .btn--import'], 'clickInput');
    t.equal(events['change #import--key'], 'checkFile');
    t.end();
});

test('setup/View: childViewEvents()', t => {
    const events = View.prototype.childViewEvents();
    t.equal(typeof events, 'object');
    t.equal(events['show:username'], 'showUsername');
    t.equal(events['go:auth'], 'destroy');
    t.end();
});

test('setup/View: onRender()', t => {
    const view = new View();
    sand.stub(view, 'showUsername');

    view.onRender();
    t.equal(view.showUsername.called, true, 'shows "username" form');

    sand.restore();
    t.end();
});

test('setup/View: showUsername()', t => {
    const view = new View();
    sand.stub(view, 'showChildView');

    view.showUsername();
    t.equal(view.showChildView.calledWith('content'), true,
        'renders "username" form in "content" region');

    sand.restore();
    t.end();
});

test('setup/View: showRegister()', t => {
    const view = new View();
    sand.stub(view, 'showChildView');

    view.showRegister();
    t.equal(view.showChildView.calledWith('content'), true,
        'renders "username" form in "content" region');

    sand.restore();
    t.end();
});

test('setup/View: checkFile()', t => {
    const view = new View();
    sand.stub(view, 'trigger');

    view.checkFile({target: {files: ['file']}});
    t.equal(view.trigger.calledWith('read:key', {file: 'file'}), true,
        'triggers "read:key"');

    sand.restore();
    t.end();
});

test('setup/View: onSaveAfter()', t => {
    const view = new View();
    sand.stub(view, 'showChildView');

    view.onSaveAfter({});
    t.equal(view.showChildView.calledWith('content'), true,
        'renders "export" view');

    sand.restore();
    t.end();
});
