/**
 * @file Test collections/Edits
 */
import test from 'tape';
import sinon from 'sinon';
import _ from '../../../app/scripts/utils/underscore';
import Edits from '../../../app/scripts/collections/Edits';
import Edit from '../../../app/scripts/models/Edit';

let sand;
test('collections/Edits: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/Edits: model', t => {
    t.equal(Edits.prototype.model, Edit);
    t.end();
});

test('collections/Edits: findForDoc()', t => {
    const edit  = new Edit({
        username: 'test', deviceId: '1', docId: '1', docType: 'notes',
    });
    const edits = new Edits([edit]);

    // Test if it can find the existing edit
    const edit1 = edits.findForDoc(
        {username: 'test', deviceId: '1'},
        {id: '1', storeName: 'notes'}
    );
    t.equal(edit1, edit, 'returns the existing edit');

    // Test if it can create a new edit
    const data  = {username: 'test2', deviceId: '1', docId: '2', docType: 'notes'};
    const edit2 = edits.findForDoc(
        _.pick(data, 'username', 'deviceId'),
        {id: data.docId, storeName: data.docType}
    );

    t.equal(edits.findWhere(data), edit2, 'adds the new edit to the collection');
    _.each(data, (val, key) => {
        t.equal(edit2.get(key), val, `creates a new edit with ${key}=${val}`);
    });

    t.end();
});

test('collections/Edits: findOrCreate()', t => {
    const edit = new Edit({
        id: 'rand', username: 'test', deviceId: '1', docId: '1', docType: 'notes',
    });
    const edits = new Edits([edit]);

    // Test if it can find the existing edit
    const edit1 = edits.findOrCreate({
        username: 'test', deviceId: '1', docId: '1', docType: 'notes',
    });
    t.equal(edit1, edit, 'returns the existing edit');

    // Test if it can create a new edit
    const data  = {username: 'test2', deviceId: '1', docId: '1', docType: 'notes'};
    const edit2 = edits.findOrCreate(data);

    t.equal(edits.findWhere(data), edit2, 'adds the new edit to the collection');
    _.each(data, (val, key) => {
        t.equal(edit2.get(key), val, `creates a new edit with ${key}=${val}`);
    });

    t.end();
});
