/**
 * @file Test collections/modules/Edits
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../app/scripts/utils/underscore';
import Module from '../../../../app/scripts/collections/modules/Edits';
import Edits from '../../../../app/scripts/collections/Edits';

import Edit from '../../../../app/scripts/models/Edit';
import Shadow from '../../../../app/scripts/models/Shadow';

let sand;
test('collections/modules/Edits: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('collections/modules/Edits: Collection', t => {
    const mod = new Module();
    t.equal(mod.Collection, Edits);
    t.end();
});

test('collections/modules/Edits: constructor()', t => {
    const reply = sand.stub(Module.prototype.channel, 'reply');
    const mod   = new Module();

    t.equal(reply.calledWith({
    }), true, 'replies to additional requests');

    sand.restore();
    t.end();
});
