/**
 * Test behaviors/Navigate.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Mn from 'backbone.marionette';
import Mousetrap from 'mousetrap';
import $ from 'jquery';
import '../../../app/scripts/utils/underscore';

import Navigate from '../../../app/scripts/behaviors/Navigate';
import Notes from '../../../app/scripts/collections/Notes';

class View extends Mn.View {
    get useNavigateKeybindings() {
        return true;
    }

    behaviors() {
        return [Navigate];
    }
}

let sand;
test('behaviors/Navigate: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('behaviors/Navigate: initialize()', t => {
    const navigate = Navigate.prototype;
    const bind     = sand.stub(navigate, 'bindKeys');
    const listen   = sand.stub(navigate, 'listenTo');

    View.prototype.channel = {channelName: 'test'};
    const view     = new View({
        collection : new Notes(),
        configs    : {test: 'yes'},
    });

    t.equal(bind.called, true, 'starts listening to keybinding events');

    t.equal(listen.calledWith(view.collection.channel, 'model:navigate'), true,
        'listens to model:navigate event on collection channel');
    t.equal(listen.calledWith(view.channel, 'model:active'),
        true, 'listens to model:active event');

    t.equal(listen.calledWith(view, 'childview:scroll:top', navigate.onScrollTop), true,
        'listens to childview:scroll:top event');
    t.equal(listen.calledWith(view, 'navigate:next', navigate.navigateNextModel),
        true, 'listens to navigate:next event');
    t.equal(listen.calledWith(view, 'navigate:previous', navigate.navigatePreviousModel),
        true, 'listens to navigate:previous event');

    sand.restore();
    t.end();
});

test('behaviors/Navigate: bindKeys()', t => {
    const navigate   = Navigate.prototype;
    const bind       = sand.spy(Mousetrap, 'bind');
    navigate.configs = {navigateBottom: 'j', navigateTop: 'k'};

    navigate.bindKeys();
    t.equal(bind.calledWith('j'), true, 'binds navigateBottom keybinding');
    t.equal(bind.calledWith('k'), true, 'binds navigateTop keybinding');

    sand.stub(navigate, 'navigateNextModel');
    Mousetrap.trigger('j');
    t.equal(navigate.navigateNextModel.called, true,
        'calls navigateNextModel method');

    sand.stub(navigate, 'navigatePreviousModel');
    Mousetrap.trigger('k');
    t.equal(navigate.navigatePreviousModel.called, true,
        'calls navigatePreviousModel method');

    navigate.configs = null;
    Mousetrap.unbind(['j', 'k']);
    sand.restore();
    t.end();
});

test('behaviors/Navigate: onDestroy()', t => {
    const navigate   = Navigate.prototype;
    navigate.view    = {useNavigateKeybindings: true};
    const unbind     = sand.spy(Mousetrap, 'unbind');
    navigate.configs = {navigateBottom: 'j', navigateTop: 'k'};

    navigate.onDestroy();
    t.equal(unbind.calledWith(['j', 'k']), true, 'unbinds navigate keybindings');

    navigate.view    = null;
    navigate.configs = null;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: onScrollTop()', t => {
    const navigate   = Navigate.prototype;
    navigate.$scroll = $('body');
    const scrollTop  = sand.spy(navigate.$scroll, 'scrollTop');

    navigate.onScrollTop({offset: 1});
    t.equal(scrollTop.called, true, 'changes scroll position');

    navigate.$scroll = null;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: navigateNextModel()', t => {
    const navigate      = Navigate.prototype;
    navigate.collection = new Notes();
    navigate.view       = {options: {filterArgs: {id: '1'}}};

    const stub = sand.stub(navigate.collection, 'navigateNextModel');
    navigate.navigateNextModel();
    t.equal(stub.calledWith('1'), true,
        'calls this.collection.navigateNextModel method');

    navigate.collection = null;
    navigate.view       = null;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: navigatePreviousModel()', t => {
    const navigate      = Navigate.prototype;
    navigate.collection = new Notes();
    navigate.view       = {options: {filterArgs: {id: '1'}}};

    const stub = sand.stub(navigate.collection, 'navigatePreviousModel');
    navigate.navigatePreviousModel();
    t.equal(stub.calledWith('1'), true,
        'calls this.collection.navigatePreviousModel method');

    navigate.collection = null;
    navigate.view       = null;
    sand.restore();
    t.end();
});

test('behaviors/Navigate: onModelNavigate()', t => {
    const navigate = Navigate.prototype;
    navigate.view  = {options: {filterArgs: {}}};
    const model    = new Notes.prototype.model({id: '2'});
    sand.stub(model, 'trigger');
    navigate.collection = new Notes([model]);

    navigate.onModelNavigate({model: model.clone()});

    t.equal(navigate.view.options.filterArgs.id, '2', 'updates filter parameters');
    t.equal(model.trigger.calledWith('focus'), true,
        'triggers "focus" event on the model');

    navigate.collection = null;
    navigate.view = null;
    sand.restore();
    t.end();
});
