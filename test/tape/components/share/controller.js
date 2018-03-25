/**
 * Test components/share/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Controller from '../../../../app/scripts/components/share/Controller';
import Note from '../../../../app/scripts/models/Note';
import Users from '../../../../app/scripts/collections/Users';
import View from '../../../../app/scripts/components/share/View';

let sand;
test('share/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('share/Controller: channel', t => {
    const channel = Controller.prototype.channel;
    t.equal(typeof channel, 'object');
    t.equal(channel.channelName, 'components/share');
    t.end();
});

test('share/Controller: initialize()', t => {
    const reply = sand.stub(Controller.prototype.channel, 'reply');
    const con   = new Controller();

    t.equal(reply.calledWith({
        show: con.init,
    }, con), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('share/Controller: init()', t => {
    const con     = new Controller();
    const req     = sand.stub(Radio, 'request');
    const model   = new Note();
    const users   = new Users();

    req.withArgs('collections/Profiles', 'getProfile').returns('alice');
    req.withArgs('collections/Users').returns(Promise.resolve(users));
    sand.stub(con, 'show');

    const res     = con.init({model});
    t.equal(con.username, 'alice', 'creates "username" property');
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.show.calledWith({model}, users), true, 'msg');

        sand.restore();
        t.end();
    });
});

test('share/Controller: show()', t => {
    const con = new Controller();
    const listen = sand.stub(con, 'listenTo');

    con.show({model: {}});
    t.equal(listen.calledWith(con.view, 'search:user', con.searchUser), true,
        'searches a user on the signaling server');
    t.equal(listen.calledWith(con.view, 'childview:add:trust', con.addTrust), true,
        'adds a user to trust');
    t.equal(listen.calledWith(con.view, 'childview:share', con.shareWith), true,
        'shares a document');

    sand.restore();
    t.end();
});

test('share/Controller: searchUser()', t => {
    const con    = new Controller();
    con.username = 'me';
    let username = 'me';
    con.view     = {
        options       : {users: new Users([{username: 'bob'}])},
        ui            : {search: {val: () => username}},
        triggerMethod : sand.stub(),
        showUserInfo  : sand.stub(),
    };

    const req = sand.stub(con.signalChannel, 'request');
    req.returns(Promise.resolve({}));

    username = '';
    con.searchUser();
    t.equal(req.notCalled, true, 'does nothing if the username is empty');

    username = 'me';
    con.searchUser();
    t.equal(req.notCalled, true, 'does nothing if a user is searching themselves');

    username = 'bob';
    con.searchUser();
    t.equal(req.notCalled, true, 'does nothing if the user already exists');

    username = 'test';
    con.searchUser()
    .then(() => {
        t.equal(con.view.triggerMethod.calledWith('search', {disabled: true}), true,
            'disables the search form');
        t.equal(con.view.triggerMethod.calledWith('search', {disabled: false}), true,
            'enables the search form again');

        t.equal(con.view.showUserInfo.notCalled, true,
            'does not show the user information if the server returned nothing');
        t.equal(con.view.triggerMethod.calledWith('user:error'), true,
            'triggers "user:error" event');

        const user = {username: 'test'};
        req.returns(Promise.resolve(user));
        return con.searchUser();
    })
    .then(() => {
        t.equal(con.view.showUserInfo.called, true,
            'shows the user information');

        sand.restore();
        t.end();
    });
});

test('share/Controller: addTrust()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').returns(Promise.resolve());
    con.view  = {
        options   : {user: 'test'},
        showUsers : sand.stub(),
    };

    con.addTrust(con.view)
    .then(() => {
        t.equal(req.calledWith('collections/Users', 'invite', {
            user: con.view.options.user,
        }), true, 'adds the user to trust');

        t.equal(con.view.showUsers.called, true, 'shows a list of trusted users');

        sand.restore();
        t.end();
    });
});

test('share/Controller: shareWith()', t => {
    const con   = new Controller();
    const model = new Note();
    con.view    = {model};

    sand.stub(model, 'toggleShare');
    sand.stub(model.channel, 'request');

    con.shareWith({username: 'test'});

    t.equal(model.toggleShare.calledWith('test'), true,
        'shares a model with a user');
    t.equal(model.channel.request.calledWith('saveModel', {model}), true,
        'saves the document');

    sand.restore();
    t.end();
});

test('share/Controller: after()', t => {
    Radio.channel('components/share').stopReplying();
    t.end();
});
