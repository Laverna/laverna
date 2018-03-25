/**
 * @file Test collections/Shadows
 */
import test from 'tape';
import sinon from 'sinon';
import _ from '../../../app/scripts/utils/underscore';
import Shadows from '../../../app/scripts/collections/Shadows';
import Shadow from '../../../app/scripts/models/Shadow';

let sand;
test('collections/Shadows: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/Shadows: model', t => {
    t.equal(Shadows.prototype.model, Shadow);
    t.end();
});

test('collections/Shadows: findForDoc()', t => {
    const shadow  = new Shadow({
        username: 'test', deviceId: '1', docId: '1', docType: 'notes',
    });
    const shadows = new Shadows([shadow]);

    // Test if it can find the existing shadow
    const shadow1 = shadows.findForDoc(
        {username: 'test', deviceId: '1'},
        {id: '1', storeName: 'notes'}
    );
    t.equal(shadow1, shadow, 'returns the existing shadow');

    // Test if it can create a new shadow
    const data    = {username: 'test2', deviceId: '1', docId: '2', docType: 'notes'};
    const shadow2 = shadows.findForDoc(
        _.pick(data, 'username', 'deviceId'),
        {id: data.docId, storeName: data.docType}
    );
    _.each(data, (val, key) => {
        t.equal(shadow2.get(key), val, `creates a new shadow with ${key}=${val}`);
    });

    t.equal(shadows.findWhere(data), shadow2,
        'adds the new shadow to the collection');

    t.end();
});

test('collections/Shadows: findOrCreate()', t => {
    const spy     = sand.spy(Shadow.prototype, 'createBackup');
    const shadow  = new Shadow({
        id: 'rand', username: 'test', deviceId: '1', docId: '1', docType: 'notes',
    });
    const shadows = new Shadows([shadow]);

    // Test if it can find the existing shadow
    const shadow1 = shadows.findOrCreate({
        username: 'test', deviceId: '1', docId: '1', docType: 'notes',
    });
    t.equal(shadow1, shadow, 'returns the existing shadow');
    t.equal(spy.notCalled, true, 'does not create a backup');

    // Test if it can create a new shadow
    const data    = {username: 'test2', deviceId: '1', docId: '1', docType: 'notes'};
    const shadow2 = shadows.findOrCreate(data);

    _.each(data, (val, key) => {
        t.equal(shadow2.get(key), val, `creates a new shadow with ${key}=${val}`);
    });

    t.equal(spy.called, true, 'creates a shadow backup');
    t.equal(shadows.findWhere(data), shadow2,
        'adds the new shadow to the collection');

    shadow2.save()
    .then(() => {
        shadows.findOrCreate(data);
        t.equal(spy.callCount, 1, 'creates backups only for new shadows');

        sand.restore();
        t.end();
    });
});
