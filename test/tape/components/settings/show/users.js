/**
 * Test components/settings/show/sync/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import Radio from 'backbone.radio';
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/sync/Users';
import Users from '../../../../../app/scripts/collections/Users';
/* eslint-enable */

let sand;
test('settings/show/sync/Users: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/sync/Users: collectionEvents()', t => {
    const collEvents = View.prototype.collectionEvents();

    t.equal(typeof collEvents, 'object');
    t.equal(collEvents['add change update'], 'render',
        're-renders the view after collection changes');

    t.end();
});

test('settings/show/sync/Users: events()', t => {
    const events = View.prototype.events();

    t.equal(typeof events, 'object');
    t.equal(events['click .sync--invite--reject'], 'rejectInvite');
    t.equal(events['click .sync--invite--accept'], 'acceptInvite');
    t.equal(events['click .sync--trust--remove'], 'removeFromTrust');

    t.end();
});

test('settings/show/sync/Users: showConfirm()', t => {
    const view = new View({collection: new Users([{username: 'alice'}])});
    const req  = sand.stub(Radio, 'request').resolves(true);
    const attr = sand.stub().returns('alice');
    sand.stub(view, '$').returns({attr});
    sand.stub(_, 'i18n').callsFake(str => str);

    view.showConfirm({currentTarget: '#username'}, 'are you sure?')
    .then(res => {
        t.equal(req.calledWith('components/confirm', 'show', {
            content: 'are you sure?',
        }), true, 'msg');

        t.equal(Array.isArray(res), true, 'returns an array');
        t.equal(res[0], true);
        t.equal(res[1], view.collection.at(0), 'returns the user model');

        sand.restore();
        t.end();
    });
});

test('settings/show/sync/Users: rejectInvite()', t => {
    const view     = new View();
    const model    = {id: 1};
    sand.stub(view, 'showConfirm').returns(Promise.resolve(['reject', model]));
    const e        = {currentTarget: '1'};
    model.channel  = {request: sand.stub()};

    view.rejectInvite(e)
    .then(() => {
        t.equal(view.showConfirm.calledWith(e, 'Confirm you want to reject the invite'),
            true, 'shows a confirmation dialog');
        t.equal(model.channel.request.notCalled, true, 'does not reject the invite');

        view.showConfirm.returns(Promise.resolve(['confirm', model]));
        return view.rejectInvite(e);
    })
    .then(() => {
        t.equal(model.channel.request.calledWith('rejectInvite', {model}), true,
            'rejects the invite');

        sand.restore();
        t.end();
    });
});

test('settings/show/sync/Users: acceptInvite()', t => {
    const view     = new View();
    const model    = {id: 1};
    sand.stub(view, 'showConfirm').returns(Promise.resolve(['reject', model]));
    const e        = {currentTarget: '1'};
    model.channel  = {request: sand.stub()};

    view.acceptInvite(e)
    .then(() => {
        t.equal(view.showConfirm.calledWith(e, 'Confirm you want to add the user to trust'),
            true, 'shows a confirmation dialog');
        t.equal(model.channel.request.notCalled, true, 'does not accept the invite');

        view.showConfirm.returns(Promise.resolve(['confirm', model]));
        return view.acceptInvite(e);
    })
    .then(() => {
        t.equal(model.channel.request.calledWith('acceptInvite', {model}), true,
            'accepts the invite');

        sand.restore();
        t.end();
    });
});

test('settings/show/sync/Users: removeFromTrust()', t => {
    const view     = new View();
    const model    = {id: 1};
    sand.stub(view, 'showConfirm').returns(Promise.resolve(['reject', model]));
    const e        = {preventDefault: sand.stub()};
    model.channel  = {request: sand.stub()};

    view.removeFromTrust(e)
    .then(() => {
        t.equal(e.preventDefault.called, true, 'prevents the default behaviour');
        t.equal(view.showConfirm.calledWith(e, 'Confirm you want to remove the user from trust'),
            true, 'shows a confirmation dialog');
        t.equal(model.channel.request.notCalled, true,
            'does not remove the user from trust');

        view.showConfirm.returns(Promise.resolve(['confirm', model]));
        return view.removeFromTrust(e);
    })
    .then(() => {
        t.equal(model.channel.request.calledWith('remove', {model}), true,
            'removes the user from trust');

        sand.restore();
        t.end();
    });
});

test('settings/show/sync/Users: serializeData()', t => {
    const collection = new Users([{pendingAccept: true}, {pendingInvite: true}]);
    const view       = new View({collection});

    const data = view.serializeData();
    t.equal(data.pendingUsers.length, collection.getPending().length,
        'shows a list of users who are waiting for your approval');

    t.equal(data.trustedUsers.length, collection.getTrusted().length,
        'shows a list of users whom you trust');

    t.end();
});
