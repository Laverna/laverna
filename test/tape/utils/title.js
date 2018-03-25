/**
 * Test utils/Title.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../app/scripts/utils/underscore';
import Title from '../../../app/scripts/utils/Title';

let sand;
test('Title: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Title: channel', t => {
    const channel = Title.prototype.channel;
    t.equal(typeof channel, 'object', 'returns an object');
    t.equal(channel.channelName, 'utils/Title');
    t.end();
});

test('Title: constructor()', t => {
    const reply = sand.stub(Title.prototype.channel, 'reply');
    const title = new Title();

    t.equal(typeof title.opt, 'object', 'creates "opt" property');

    t.equal(reply.calledWith({
        set : title.set,
    }, title), true, 'replies to requests');

    t.end();
});

test('Title: options - set', t => {
    const title   = new Title();
    title.options = {
        filter    : 'tag',
        query     : '1',
        title     : 'Test',
        section   : '1',
        profileId : 'test',
    };

    t.deepEqual(_.keys(title.options), _.keys(title.opt),
        'does not use keys that are not in the original options');

    title.channel.stopReplying();
    t.end();
});

test('Title: options - get', t => {
    const title = new Title();
    t.deepEqual(title.options, title.opt, 'uses the original options');

    title.options = {title: 'Test'};
    t.deepEqual(_.keys(title.options), _.keys(title.opt),
        'always has the same amount of keys');
    t.equal(title.options.title, 'Test');

    title.channel.stopReplying();
    t.end();
});

test('Title: set()', t => {
    const title = new Title();
    sand.stub(title, 'setSection').returns(Promise.resolve(''));
    sand.stub(title, 'setTitle');

    title.set({title: 'Test'});
    t.equal(title.setSection.notCalled, true,
        'does not change section title if the main title is provided');
    t.equal(title.setTitle.calledWith({title: 'Test'}), true,
        'sets document title');

    title.set({filter: 'tag'})
    .then(() => {
        t.equal(title.setSection.calledWith({filter: 'tag'}), true,
            'sets section title if filter arguments are provided');
        t.equal(title.setTitle.calledAfter(title.setSection), true,
            'sets document title');

        title.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Title: setTitle()', t => {
    const title = new Title();

    title.setTitle({title: 'Test'});
    t.deepEqual(_.omit(title.options, 'title'), _.omit(title.opt, 'title'),
        'changes only title');
    t.equal(document.title, 'Test - Laverna');

    title.setTitle({section: 'Tag', title: 'Test 2'});
    t.equal(document.title, 'Test 2 - Tag - Laverna');

    title.channel.stopReplying();
    t.end();
});

test('Title: setSection()', t => {
    const title    = new Title();
    const filter   = sand.stub(title, 'getTitleFromFilter')
    .resolves('test');
    const notebook = sand.stub(title, 'notebookTitle')
    .resolves('notebook');

    const options = {query: 'test', filter: 'notebook'};
    title.setSection(options)
    .then(() => {
        t.equal(notebook.calledWith(options), true,
            'calls notebookTitle method');
        t.equal(title.options.section, 'notebook', 'changes section title');

        options.filter = 'tag';
        return title.setSection(options);
    })
    .then(() => {
        t.equal(filter.calledWith(options), true,
            'calls getTitleFromFilter method');
        t.equal(title.options.section, 'test', 'changes section title');

        title.channel.stopReplying();
        sand.restore();
        t.end();
    });
});

test('Title: getTitleFromFilter()', t => {
    const title = new Title();
    sand.stub(_, 'i18n').callsFake(str => str);

    t.equal(title.getTitleFromFilter({filter: 'search', query: 'test'}), 'Test',
        'uses "query" as title if it is search filter');
    t.equal(title.getTitleFromFilter({filter: 'tag', query: 'mytag'}), 'Mytag',
        'uses "query" as title if it is tag filter');

    t.equal(title.getTitleFromFilter({filter: 'favorite'}), 'Favorite');
    t.equal(title.getTitleFromFilter({filter: 'active'}), 'All notes');

    title.channel.stopReplying();
    sand.restore();
    t.end();
});

test('Title: notebookTitle()', t => {
    const title = new Title();
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve({
        get: () => 'notebookname',
    }));

    const res = title.notebookTitle({query: 'id-1', profileId: 'test'});
    t.equal(req.calledWith('collections/Notebooks', 'findModel', {
        id: 'id-1', profileId: 'test',
    }), true, 'makes findModel request');

    res.then(res => {
        t.equal(res, 'Notebookname', 'returns capitalized notebook name');

        title.channel.stopReplying();
        sand.restore();
        t.end();
    });
});
