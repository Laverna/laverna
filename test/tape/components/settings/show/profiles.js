/**
 * Test components/settings/show/profiles/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/profiles/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/profiles/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/profiles/View: configsChannel', t => {
    t.equal(View.prototype.configsChannel.channelName, 'collections/Configs');
    t.end();
});

test('settings/show/profiles/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.profile, '#profileName');

    t.end();
});

test('settings/show/profiles/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['keypress @ui.profile'], 'createOnEnter',
        'creates a new profile if enter is pressed');
    t.equal(events['click .removeProfile'], 'removeProfile',
        'removes a profile if the button is clicked');

    t.end();
});

test('settings/show/profiles/View: initialize()', t => {
    const listen = sand.stub(View.prototype, 'listenTo');
    const view   = new View({profiles: {id: 'profiles'}});
    t.equal(listen.calledWith(view.options.profiles, 'change', view.render), true,
        're-renders the view if profiles model is changed');

    sand.restore();
    t.end();
});

test('settings/show/profiles/View: createOnEnter()', t => {
    const view = new View();
    sand.stub(view, 'createProfile');

    view.createOnEnter({which: 2});
    t.equal(view.createProfile.notCalled, true,
        'does nothing if enter is not pressed');

    const e = {which: 13, preventDefault: sand.stub()};
    view.createOnEnter(e);
    t.equal(e.preventDefault.called, true, 'prevents the default behavior');
    t.equal(view.createProfile.called, true,
        'creates a new profile if enter is pressed');

    sand.restore();
    t.end();
});

test('settings/show/profiles/View: createProfile()', t => {
    const profiles = new Configs.prototype.model({value: []});
    const view = new View({profiles});
    view.ui    = {profile: {val: sand.stub().returns('')}};
    const req  = sand.stub(view.configsChannel, 'request');
    req.returns(Promise.resolve());

    view.createProfile();
    t.equal(req.notCalled, true, 'does nothing if profile name is empty');

    view.ui.profile.val.returns('test');
    const res = view.createProfile()
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(req.calledWith('createProfile', {name: 'test'}), true,
            'creates a new profile');
        t.deepEqual(profiles.get('value'), ['test'],
            'adds the new profile to the profiles model');

        sand.restore();
        t.end();
    });
});

test('settings/show/profiles/View: removeProfile()', t => {
    const view = new View();
    const attr = sand.stub().returns('');
    const jq   = sand.stub(view, '$').withArgs('#test').returns({attr});

    const confirm = sand.stub(Radio, 'request').returns(Promise.resolve());
    const remove  = sand.stub(view.configsChannel, 'request');

    view.removeProfile({currentTarget: '#test', preventDefault: sand.stub()});
    t.equal(confirm.notCalled, true, 'does nothing if profile name is empty');

    attr.returns('test');
    view.removeProfile({currentTarget: '#test', preventDefault: sand.stub()})
    .then(() => {
        t.equal(confirm.calledWith('components/confirm', 'show'), true,
            'shows a confirmation dialog');
        t.equal(remove.notCalled, true,
            'does not remove the profile if a user did not confirm the removal');

        confirm.returns(Promise.resolve('confirm'));
        return view.removeProfile({currentTarget: '#test', preventDefault: sand.stub()})
    })
    .then(() => {
        t.equal(remove.calledWith('removeProfile', {name: 'test'}), true,
            'removes the profile');

        sand.restore();
        t.end();
    });
});

test('settings/show/profiles/View: serializeData()', t => {
    const profiles = new Configs.prototype.model({value: ['1', '2']});
    const view = new View({profiles});

    t.deepEqual(view.serializeData(), {
        appProfiles: profiles.get('value'),
    });

    t.end();
});
