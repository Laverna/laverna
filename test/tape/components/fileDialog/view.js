/**
 * Test components/fileDialog/views/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import $ from 'jquery';
// import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';

import View from '../../../../app/scripts/components/fileDialog/View';
import ModalForm from '../../../../app/scripts/behaviors/ModalForm';

let sand;
test('fileDialog/views/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('fileDialog/views/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('fileDialog/views/View: behaviors', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'is an array');
    t.equal(behaviors.indexOf(ModalForm) !== -1, true, 'uses ModalForm behavior');
    t.end();
});

test('fileDialog/views/View: uiFocus', t => {
    t.equal(View.prototype.uiFocus, 'url');
    t.end();
});

test('fileDialog/views/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.url, '[name=url]');
    t.equal(ui.okBtn, '#ok-btn');
    t.equal(ui.attach, '#btn-attach');

    t.end();
});

test('fileDialog/views/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['keyup @ui.url'], 'toggleAttachBtn');
    t.equal(events['click .attach-file'], 'attachFile');
    t.end();
});

test('fileDialog/View: constructor()', t => {
    const view = new View();
    t.equal(Array.isArray(view.files), true, 'creates "files" property');
    t.equal(view.files.length, 0, 'files property is empty');
    t.end();
});

test('fileDialog/View: onShownModal()', t => {
    const view       = new View();
    global.Modernizr = global.Modernizr || {};
    global.Modernizr.indexeddb = true;
    $('<div class="dropzone"/>').appendTo($('body'));
    Object.defineProperty(view, 'dropzoneTemplate', {get: () => ''});

    view.onShownModal();
    t.equal(typeof view.dropzone, 'object', 'creates "dropzone" property');

    const opt = {
        url                : '/#notes',
        clickable          : true,
        thumbnailWidth     : 100,
        thumbnailHeight    : 100,
        previewTemplate    : view.dropzoneTemplate,
        dictDefaultMessage : _.i18n('Drop files'),
    };
    _.each(opt, (val, key) => {
        t.equal(view.dropzone.options[key], val, `changes ${key} option`);
    });

    t.end();
});

test('fileDialog/View: toggleAttachBtn', t => {
    const view = new View();
    view.ui    = {
        okBtn  : {toggleClass : sand.stub()},
        attach : {toggleClass : sand.stub()},
        url    : {val: () => 'test'},
    };

    view.toggleAttachBtn();
    t.equal(view.ui.okBtn.toggleClass.calledWith('hidden', true), true,
        'hides "ok" button if "URL" input is not empty');
    t.equal(view.ui.attach.toggleClass.calledWith('hidden', false), true,
        'shows "attach" button if "URL" input is not empty');

    view.ui.url.val = () => '';
    view.toggleAttachBtn();
    t.equal(view.ui.okBtn.toggleClass.calledWith('hidden', false), true,
        'shows "ok" button if "URL" input is not empty');
    t.equal(view.ui.attach.toggleClass.calledWith('hidden', true), true,
        'hides "attach" button if "URL" input is not empty');

    sand.restore();
    t.end();
});

test('fileDialog/View: attachFile()', t => {
    const view           = new View();
    const preventDefault = sand.stub();
    sand.stub(view, 'trigger');

    view.attachFile({preventDefault})
    t.equal(preventDefault.called, true, 'prevents the default behavior');
    t.equal(view.trigger.calledWith('save', {isFile: true}), true,
        'triggers "save" event');

    sand.restore();
    t.end();
});

test('fileDialog/View: getImage()', t => {
    const view    = new View();
    const trigger = sand.stub();
    view.ui       = {
        url: {val: sand.stub().returns({trigger})},
    };
    const reader = {onload: sand.stub(), readAsDataURL: sand.stub()};
    global.FileReader = function() {
        return reader;
    };

    const file = {name: 'test', type: 'image/png'};
    view.getImage(file);
    t.equal(trigger.calledWith('keyup'), true,
        'empties URL input and triggers keyup event');
    t.equal(reader.readAsDataURL.calledWith(file), true,
        'starts reading the file');

    reader.onload({target: {result: '1'}});
    t.equal(view.files.length, 1, 'adds file information to "files" property');
    t.equal(view.files[0].name, 'test');
    t.equal(view.files[0].src, '1');
    t.equal(view.files[0].fileType, 'image/png');

    global.FileReader = undefined;
    t.end();
});
