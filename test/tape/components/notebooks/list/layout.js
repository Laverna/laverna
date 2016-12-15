/**
 * Test components/notebooks/list/views/Layout
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Mousetrap from 'mousetrap';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/notebooks/list/views/Layout';
import Notebooks from '../../../../../app/scripts/collections/Notebooks';
import Tags from '../../../../../app/scripts/collections/Tags';
import Sidebar from '../../../../../app/scripts/behaviors/Sidebar';
/* eslint-enable */

let sand;
test('notebooks/list/views/Layout: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('notebooks/list/views/Layout: behaviors', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'is an array');
    t.equal(behaviors.indexOf(Sidebar) !== -1, true, 'uses sidebar behavior');
    t.end();
});

test('notebooks/list/views/Layout: noSwipeLeft', t => {
    t.equal(View.prototype.noSwipeLeft, true,
        'does nothing on swipeleft event');
    t.end();
});

test('notebooks/list/views/Layout: keybindings', t => {
    const key = View.prototype.keybindings;
    t.equal(Array.isArray(key), true, 'is an array');
    t.equal(key.length, 5);
    t.end();
});

test('notebooks/list/views/Layout: regions()', t => {
    const regions = View.prototype.regions();
    t.equal(typeof regions, 'object', 'returns an object');
    t.equal(regions.notebooks, '#notebooks');
    t.equal(regions.tags, '#tags');
    t.end();
});

test('notebooks/list/views/Layout: constructor()', t => {
    const listen   = sand.stub(View.prototype, 'listenTo');
    const view     = new View({
        notebooks : new Notebooks([{id: '1'}]),
        tags      : new Tags([{id: '1'}]),
    });
    const {notebooks, tags} = view.options;

    t.equal(view.activeRegion, 'notebooks',
        'makes notebooks region active if the notebooks collection is not empty');

    t.equal(listen.calledWith(notebooks.channel, 'page:end', view.switchToTags), true,
        'switches to tags region if notebooks collection triggers page:end event');
    t.equal(listen.calledWith(tags.channel, 'page:start', view.switchToNotebooks), true,
        'switches to notebooks region if tags collection triggers page:start event');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: onDestroy()', t => {
    const view = new View({
        notebooks : {},
        tags      : {},
        configs   : {
            jumpOpenTasks  : 'g o',
            actionsOpen    : 'o',
            actionsEdit    : 'e',
            actionsRemove  : '#',
            navigateBottom : 'j',
            navigateTop    : 'k',
        },
    });
    const bind = sand.stub(Mousetrap, 'unbind');

    view.destroy();
    t.equal(bind.calledWith(['o', 'e', '#', 'j', 'k']), true,
        'unbinds all keyboard events');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: onRender()', t => {
    const view = new View({
        notebooks : {},
        tags      : {},
        profileId : 'test',
    });
    const bindKeys = sand.stub(view, 'bindKeys');
    const show     = sand.stub(view, 'showChildView');

    view.onRender();
    t.equal(bindKeys.called, true, 'starts listening to keyboard events');
    t.equal(show.calledWith('notebooks'), true, 'shows notebooks list');
    t.equal(show.calledWith('tags'), true, 'shows tags list');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: bindKeys()', t => {
    const view = new View({
        notebooks : new Notebooks(),
        tags      : new Tags(),
        configs   : {
            jumpOpenTasks  : 'g o',
            actionsOpen    : 'o',
            actionsEdit    : 'e',
            actionsRemove  : '#',
            navigateBottom : 'j',
            navigateTop    : 'k',
        },
    });
    const bind = sand.stub(Mousetrap, 'bind');

    view.bindKeys();
    ['o', 'e', '#', 'j', 'k'].forEach(key => {
        t.equal(bind.calledWith(key), true, `binds ${key} keyboard event`);
    });

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: actionsOpen()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    const $a   = {href: '/notebooks'};
    const nav  = sand.stub(view, 'navigateToLink');
    sand.stub(view, '$').returns($a);

    view.actionsOpen();
    t.equal(view.$.calledWith('.list-group-item.active'), true,
        'searches for the active element in DOM');
    t.equal(nav.calledWith($a), true, 'calls navigateToLink method');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: actionsEdit()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    const find = sand.stub();
    sand.stub(view, '$').returns({parent: sand.stub().returns({find})});
    sand.stub(view, 'navigateToLink');

    view.actionsEdit();
    t.equal(find.calledWith('.edit-link:first'), true,
        'finds the edit link of the currently active notebook/tag');
    t.equal(view.navigateToLink.called, true, 'calls navigateToLink method');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: navigateToLink()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    const req  = sand.stub(Radio, 'request');

    view.navigateToLink({attr: () => '/notebooks'});
    t.equal(req.calledWith('utils/Url', 'navigate', {
        url: '/notebooks',
    }), true, 'makes navigate request');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: actionsRemove()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    const $a   = {trigger: sand.stub()};
    const find = sand.stub().returns($a);
    sand.stub(view, '$').returns({parent: sand.stub().returns({find})});

    view.actionsRemove();
    t.equal(find.calledWith('.remove-link:first'), true,
        'finds the remove button of the currently active notebook/tag');
    t.equal($a.trigger.calledWith('click'), true, 'triggers click event');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: navigateBottom() - navigateTop()', t => {
    const view   = new View({notebooks: new Notebooks(), tags: new Tags()});
    const region = {trigger: sand.stub()};
    const get    = sand.stub(view, 'getChildView').returns(region);

    view.activeRegion = 'notebooks';
    view.navigateBottom();
    t.equal(get.calledWith('notebooks'), true, 'finds the currently active region');
    t.equal(region.trigger.calledWith('navigate:next'), true,
        'triggers navigate:next on the currently active region\'s view');

    view.navigateTop();
    t.equal(region.trigger.calledWith('navigate:previous'), true,
        'triggers navigate:previous on the currently active region\'s view');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: switchToTags()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    sand.stub(view, 'switchRegion');
    sand.stub(view, 'navigateBottom');

    view.switchToTags();
    t.equal(view.switchRegion.calledWith('tags'), true,
        'switches to tags region');
    t.equal(view.navigateBottom.called, true, 'navigates to the next model');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: switchToNotebooks()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    sand.stub(view, 'switchRegion');
    sand.stub(view, 'navigateTop');

    view.switchToNotebooks();
    t.equal(view.switchRegion.calledWith('notebooks'), true,
        'switches to notebooks region');
    t.equal(view.navigateTop.called, true, 'navigates to the previous model');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: switchRegion()', t => {
    const view    = new View({notebooks: new Notebooks(), tags: new Tags()});
    const regView = {options: {filterArgs: {id: '1'}}};
    sand.stub(view, 'getChildView').returns(regView);

    view.activeRegion = 'notebooks';
    view.switchRegion('tags');
    t.equal(view.activeRegion, 'tags', 'changes activeRegion property');
    t.equal(_.keys(regView.options.filterArgs).length, 0,
        'resets filterArgs property of the region view');

    sand.restore();
    t.end();
});

test('notebooks/list/views/Layout: serializeData()', t => {
    const view = new View({notebooks: new Notebooks(), tags: new Tags()});
    t.equal(view.serializeData(), view.options, 'returns options');
    sand.restore();
    t.end();
});
