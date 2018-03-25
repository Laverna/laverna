/**
 * Test components/encryption/encrypt/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import _ from '../../../../../app/scripts/utils/underscore';

/* eslint-disable */
import View from '../../../../../app/scripts/components/encryption/encrypt/View';
import Notes from '../../../../../app/scripts/collections/Notes';
/* eslint-enable */

let sand;
test('encryption/encrypt/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('encryption/encrypt/View: className', t => {
    t.equal(View.prototype.className, 'container text-center -auth');
    t.end();
});

test('encryption/encrypt/View: triggers()', t => {
    const trig = View.prototype.triggers();

    t.equal(typeof trig, 'object');
    t.equal(trig['click #btn--proceed'], 'proceed');

    t.end();
});

test('encryption/encrypt/View: ui()', t => {
    const ui = View.prototype.ui();

    t.equal(typeof ui, 'object');
    t.equal(ui.proceed, '#container--encryption--proceed');
    t.equal(ui.progress, '#container--encryption--progress');
    t.equal(ui.progressBar, '#progress');

    t.end();
});

test('encryption/encrypt/View: serializeData()', t => {
    const configs = {encrypt: 1};
    const view    = new View({configs});
    sand.stub(_, 'i18n').callsFake(str => str);

    t.deepEqual(view.serializeData(), {encrypt: 1, title: 'Encrypting'});

    configs.encrypt = 0;
    t.deepEqual(view.serializeData(), {encrypt: 0, title: 'Decrypting'});

    sand.restore();
    t.end();
});

test('encryption/encrypt/View: showProgress()', t => {
    const view = new View();
    view.ui    = {
        proceed  : {addClass: sand.stub()},
        progress : {removeClass: sand.stub()},
    };

    view.showProgress();
    t.equal(view.ui.proceed.addClass.calledWith('hide'), true, 'hides the warning');
    t.equal(view.ui.progress.removeClass.calledWith('hide'), true,
        'shows the progress bar');

    sand.restore();
    t.end();
});

test('encryption/encrypt/View: changeProgress()', t => {
    const view = new View();
    const css  = sand.stub();
    view.ui    = {progressBar : {css}};

    view.changeProgress({count: 2, max: 5});
    t.equal(css.calledWith('width', '40%'), true, 'changes the progress to 40%');

    view.changeProgress({count: 5, max: 5});
    t.equal(css.calledWith('width', '100%'), true, 'changes the progress to 100%');

    sand.restore();
    t.end();
});
