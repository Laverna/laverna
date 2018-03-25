/**
 * @file Test collections/modules/Shadows
 */
import test from 'tape';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import Module from '../../../../app/scripts/collections/modules/Shadows';
import Shadows from '../../../../app/scripts/collections/Shadows';

let sand;
test('collections/modules/Shadows: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Shadows: Collection', t => {
    const mod = new Module();
    t.equal(mod.Collection, Shadows);
    t.end();
});
